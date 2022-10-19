import React from "react";

class Header extends React.Component {
    render() {
        return (
            <>
                <header className="container mx-auto flex flex-row p-4 h-1/6">
                    <p className="text-sm font-extrabold leading-normal">
                        Test Header 
                    </p>
                </header>
            </>
        );
    }
}

export default Header;