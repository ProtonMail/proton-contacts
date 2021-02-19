import React from 'react';
import { Icon } from 'react-components';

interface Props {
    error: string;
}

const MergeErrorContent = ({ error }: Props) => {
    return (
        <div className="bg-global-attention p1">
            <Icon name="attention" className="mr1" />
            <span className="mr1">{error}</span>
        </div>
    );
};

export default MergeErrorContent;
