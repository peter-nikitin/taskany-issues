import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { useKeyboard, KeyCode } from '@geist-ui/core';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';

import { gray6, gray7, gray8 } from '../design/@generated/themes';
import { createFetcher } from '../utils/createFetcher';
import { Project } from '../../graphql/@generated/genql';
import { useKeyPress } from '../hooks/useKeyPress';

import { Button } from './Button';
import { Popup } from './Popup';
import { Icon } from './Icon';
import { Input } from './Input';

interface ProjectCompletionProps {
    size?: React.ComponentProps<typeof Button>['size'];
    view?: React.ComponentProps<typeof Button>['view'];
    text: React.ComponentProps<typeof Button>['text'];
    query?: string;
    placeholder?: string;
    onClick?: (project: Project) => void;
}

const StyledProjectCard = styled.div<{ focused?: boolean }>`
    padding: 6px;
    border: 1px solid ${gray7};
    border-radius: 6px;
    min-width: 250px;
    margin-bottom: 4px;
    cursor: pointer;

    &:last-child {
        margin-bottom: 0;
    }

    &:hover {
        border-color: ${gray8};
        background-color: ${gray6};
    }

    ${({ focused }) =>
        focused &&
        css`
            border-color: ${gray8};
            background-color: ${gray6};
        `}
`;
const StyledProjectInfo = styled.div`
    padding-left: 4px;
`;
const StyledProjectTitle = styled.div`
    font-size: 14px;
    font-weight: 600;
`;
const ProjectCard: React.FC<{ title?: string; focused?: boolean; onClick?: () => void }> = ({
    title,
    focused,
    onClick,
}) => {
    return (
        <StyledProjectCard onClick={onClick} focused={focused}>
            <StyledProjectInfo>
                <StyledProjectTitle>{title}</StyledProjectTitle>
            </StyledProjectInfo>
        </StyledProjectCard>
    );
};

const StyledDropdownContainer = styled.div``;

const fetcher = createFetcher((_, query: string) => ({
    projectCompletion: [
        {
            query,
        },
        {
            id: true,
            title: true,
            description: true,
            flow: {
                id: true,
                title: true,
                states: {
                    id: true,
                    title: true,
                    default: true,
                },
            },
        },
    ],
}));

export const ProjectCompletion: React.FC<ProjectCompletionProps> = ({
    size,
    text,
    view,
    onClick,
    query = '',
    placeholder,
}) => {
    const { data: session } = useSession();
    const popupRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [popupVisible, setPopupVisibility] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [inputState, setInputState] = useState(query);
    const downPress = useKeyPress('ArrowDown');
    const upPress = useKeyPress('ArrowUp');
    const [cursor, setCursor] = useState(0);
    const { data } = useSWR(inputState, (q) => fetcher(session?.user, q));

    const onClickOutside = useCallback(() => {
        setEditMode(false);
        setPopupVisibility(false);
        setInputState(query);
    }, [query]);

    const onButtonClick = useCallback(() => {
        setEditMode(true);
        setPopupVisibility(true);
    }, []);

    const onProjectCardClick = useCallback(
        (project: Project) => () => {
            setEditMode(false);
            setPopupVisibility(false);
            onClick && onClick(project);
            setInputState(project.title || '');
        },
        [onClick],
    );

    const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInputState(e.target.value);
    }, []);

    const { bindings: onESC } = useKeyboard(
        () => {
            popupVisible && setPopupVisibility(false);
            setEditMode(false);
        },
        [KeyCode.Escape],
        {
            stopPropagation: true,
        },
    );

    const { bindings: onENTER } = useKeyboard(
        () => {
            if (data?.projectCompletion?.length) {
                onProjectCardClick(data?.projectCompletion[cursor] as Project)();
                popupRef.current?.focus();
            }
        },
        [KeyCode.Enter],
        {
            stopPropagation: true,
        },
    );

    useEffect(() => {
        const projectCompletion = data?.projectCompletion;

        if (projectCompletion?.length && downPress) {
            setCursor((prevState) => (prevState < projectCompletion.length - 1 ? prevState + 1 : prevState));
        }
    }, [data?.projectCompletion, downPress]);

    useEffect(() => {
        if (data?.projectCompletion?.length && upPress) {
            setCursor((prevState) => (prevState > 0 ? prevState - 1 : prevState));
        }
    }, [data?.projectCompletion, upPress]);

    return (
        <>
            <StyledDropdownContainer ref={popupRef} {...onESC}>
                {editMode ? (
                    <Input
                        autoFocus
                        placeholder={placeholder}
                        value={inputState}
                        onChange={onInputChange}
                        {...onENTER}
                    />
                ) : (
                    <Button
                        ghost
                        ref={buttonRef}
                        size={size}
                        view={view}
                        text={text}
                        iconLeft={<Icon type="location" size="xs" />}
                        onClick={onButtonClick}
                    />
                )}
            </StyledDropdownContainer>

            <Popup
                placement="top-start"
                overflow="hidden"
                visible={popupVisible && Boolean(data?.projectCompletion?.length)}
                onClickOutside={onClickOutside}
                reference={popupRef}
                interactive
                minWidth={150}
                maxWidth={250}
                offset={[0, 4]}
            >
                <>
                    {data?.projectCompletion?.map((p, i) => (
                        <ProjectCard
                            key={p.id}
                            title={p.title}
                            focused={cursor === i}
                            onClick={onProjectCardClick(p as Project)}
                        />
                    ))}
                </>
            </Popup>
        </>
    );
};
