import React from "react";
import './loader.css'

const Loader = () => {
    return (
        <div className="loader_container">
            <div className="lds-ripple"><div></div><div></div></div>
        </div>
    )
}

export {Loader}