import React from 'react';
import { c } from 'ttag';
import { Href } from 'react-components';
import upgradeToPaidPlanSvg from 'design-system/assets/img/pm-images/upgrade.svg';

const UpsellFree = () => {
    const title = c('Title').t`Upgrade to a paid plan`;

    return (
        <div className="rounded bg-global-altgrey color-white p1 mb1 flex">
            <div className="flex-autogrid onmobile-flex-column w100">
                <div className="flex-autogrid-item flex flex-column flex-spacebetween">
                    <h4>{title}</h4>
                    <div className="mb2">{c('Info')
                        .t`Unlock access to encrypted contact details such as phone numbers and addresses with ProtonMail Plus.`}</div>
                    <div>
                        <Href className="pm-button pm-button--primary" target="_self" url="/settings/subscription">
                            {c('Action').t`Upgrade ProtonMail`}
                        </Href>
                    </div>
                </div>
                <div className="flex-autogrid-item flex flex-column flex-items-end">
                    <img className="h100" src={upgradeToPaidPlanSvg} alt={title} style={{ maxHeight: '200px' }} />
                </div>
            </div>
        </div>
    );
};

export default UpsellFree;
