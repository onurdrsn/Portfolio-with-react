import React from "react";

export default function Title( {children, id} ) {
    return (
        <h1 id={id && id} className="text-2xl font-bold text-center underline underline-offset-8 decoration-4 mb-5 text-white">
            {children}
        </h1>
    )
}
