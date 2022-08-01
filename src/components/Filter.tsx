import React, { FC, useRef, useState } from 'react';
import styled from 'styled-components';

import { Button } from './Button';
import { Icon } from './Icon';
import { Input } from './Input';
import { Popup } from './Popup';

const searchWidth = 'minmax(250px, 450px)';

const Search: FC = () => {
    return <Input />;
};

type FilterPopupProps = {
    buttonText: string;
};

const FilterPopup: FC<FilterPopupProps> = ({ children, buttonText }) => {
    const [isVisible, setVisible] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    return (
        <>
            <span ref={popupRef}>
                <Button
                    text={buttonText}
                    onClick={() => setVisible(!isVisible)}
                    outline
                    ghost
                    iconLeft={<Icon size={'s'} type={'arrowDownSmall'} />}
                />
            </span>
            <Popup visible={isVisible} placement="bottom-start" reference={popupRef}>
                {children}
            </Popup>
        </>
    );
};

const StyledFilterWrapper = styled.div`
    display: grid;
    grid-template-columns: ${() => `${searchWidth} auto`};
    grid-gap: 50px;
`;

type FilterComponent = FC & {
    Search: FC;
    FilterPopup: FC<FilterPopupProps>;
};

export const Filter: FilterComponent = ({ children }) => {
    return <StyledFilterWrapper>{children}</StyledFilterWrapper>;
};

Filter.Search = Search;
Filter.FilterPopup = FilterPopup;
