import React from "react";

class Header extends React.Component {
    render() {
        return (
            <>
                <header className="container mx-auto flex flex-row p-4 h-20 border-b-2">
                    <p className="text-3xl font-extrabold leading-normal">
                        V-Room 
                    </p>
                </header>
            </>
        );
    }
}

export default Header;