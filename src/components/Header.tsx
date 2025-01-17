import { useCallback, useRef, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import NextLink from 'next/link';
import styled from 'styled-components';
import { useTranslations } from 'next-intl';

import { routes } from '../hooks/router';
import { textColor, gray7, backgroundColor, colorPrimary, brandColor } from '../design/@generated/themes';

import { HeaderLogo } from './HeaderLogo';
import { Icon } from './Icon';
import { UserPic } from './UserPic';
import { Popup } from './Popup';
import { Plus } from './Plus';

const StyledHeader = styled.header`
    display: grid;
    grid-template-columns: 20px 11fr 100px;
    align-items: center;
    padding: 20px 40px;
`;

const StyledUserMenu = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-items: center;
    align-items: center;
    align-self: end;
`;

const StyledPopupContent = styled.div`
    min-width: 120px;
`;

const StyledNav = styled.nav`
    padding-left: 40px;
`;

const StyledSearch = styled.div`
    position: relative;
    display: inline-block;
    margin-left: 30px;
    top: 3px;
`;

const StyledHeaderNavLink = styled.a`
    display: inline-block;
    padding-bottom: 2px;
    margin-top: 3px;

    font-size: 18px;
    font-weight: 600;
    color: ${textColor};
    text-decoration: none;

    border-bottom: 1px solid transparent;

    transition: color, border-color 250ms ease-in-out;

    &:hover {
        color: ${textColor};
        border-color: ${colorPrimary};
    }

    & + & {
        margin-left: 24px;
    }
`;

const CreatorMenu = () => {
    const t = useTranslations('Header');
    const popupRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const [popupVisible, setPopupVisibility] = useState(false);

    const onClickOutside = useCallback(() => {
        setPopupVisibility(false);
    }, []);

    return (
        <>
            <span ref={popupRef}>
                <Plus action ref={buttonRef} onClick={() => setPopupVisibility(!popupVisible)} />
            </span>

            <Popup
                overflow="hidden"
                visible={popupVisible}
                onClickOutside={onClickOutside}
                reference={popupRef}
                interactive
                minWidth={150}
                maxWidth={250}
            >
                <StyledPopupContent>
                    <div>
                        <NextLink href={routes.createGoal()}>
                            <a>{t('New goal')}</a>
                        </NextLink>
                    </div>
                    <div>
                        <NextLink href={routes.createProject()}>
                            <a>{t('New project')}</a>
                        </NextLink>
                    </div>
                    <div>
                        <NextLink href={routes.inviteUsers()}>
                            <a>{t('Invite users')}</a>
                        </NextLink>
                    </div>
                    <div>
                        <a onClick={() => signOut()}>{t('Sign out')}</a>
                    </div>
                </StyledPopupContent>
            </Popup>
        </>
    );
};

export const Header: React.FC = () => {
    const { data: session } = useSession();
    const t = useTranslations('Header');

    return (
        <StyledHeader>
            <HeaderLogo />

            <StyledNav>
                <NextLink href={routes.goals()} passHref>
                    <StyledHeaderNavLink>{t('Goals')}</StyledHeaderNavLink>
                </NextLink>
                <NextLink href={'#'} passHref>
                    <StyledHeaderNavLink>{t('Issues')}</StyledHeaderNavLink>
                </NextLink>
                <NextLink href={'#'} passHref>
                    <StyledHeaderNavLink>{t('Boards')}</StyledHeaderNavLink>
                </NextLink>
                <NextLink href={'#'} passHref>
                    <StyledHeaderNavLink>{t('Explore')}</StyledHeaderNavLink>
                </NextLink>

                <StyledSearch>
                    <Icon type="search" size="s" color={gray7} />
                </StyledSearch>
            </StyledNav>

            <StyledUserMenu>
                <CreatorMenu />
                <UserPic src={session?.user.image} size={32} />
            </StyledUserMenu>
        </StyledHeader>
    );
};
