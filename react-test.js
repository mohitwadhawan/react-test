import React from "react";
import checkIcon from "../../assets/icons/circle-check.png";

interface SectionWrapperProps {
    title: string;
    isExpanded: boolean;
    isSuccess: boolean;
    toggle: () => void;
    children: React.ReactNode;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({ title, isExpanded, isSuccess, toggle, children }) => (
    <div className={`api-access-container ${isSuccess ? "success-step" : ""} ${isExpanded ? "" : "container-inactive"}`}>
        <div className="api-access-header" onClick={toggle} style={{ cursor: "pointer" }}>
            <div className="tab-header">
                <div className="custom-circle">
                    {isSuccess && <img src={checkIcon} alt="check" width={45} />}
                </div>
            </div>
            {title}
        </div>
        {isExpanded && children}
    </div>
);

export default SectionWrapper;
<SectionWrapper
    title="Page Options"
    isExpanded={expandedSections.variable}
    isSuccess={isVarSuccess}
    toggle={() => toggleSection("variable")}
>
    {/* Embed options, input fields, etc. */}
</SectionWrapper>
