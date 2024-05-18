import React from "react";

export default function Footer() {
    return (
        <div className="py-5 text-center">
            <p className="text-sm mt-2 opacity-50">
                &copy; {new Date().getFullYear()} All rights reserved. | Made with <span role="img" aria-label="heart">❤️</span> by <a className="text-red-500" href="https://onurdrsn.netlify.app">Onur</a>
            </p>
        </div>
    )
}