import React from "react";

interface DropdownProps {
    onSortQuestions: (value: string) => void
}

interface DropdownState {
    open: boolean,
}

class FilterDropdown extends React.Component<DropdownProps, DropdownState> {
    state = { open: false };

    handleOpen = () => {
        this.setState((state) => ({
            open: !state.open,
        }))
    };

    render() {
        return (
            <div className="relative m-auto">
                <button onClick={this.handleOpen} id="dropdownMenuIconButton" data-dropdown-toggle="dropdownDots" className="inline-flex items-center p-2 text-gray-900 rounded-lg focus:ring-2 bg-white focus:outline-nonetext-white hover:bg-gray-700 focus:ring-gray-600" type="button">
                    Sort questions by...
                </button>

                {this.state.open ? (
                    <div id="dropdownDots" className="absolute z-10 w-40 bg-white rounded shadow-md">
                        <ul className="text-sm text-gray-700" aria-labelledby="dropdownMenuIconButton">
                            <li>
                                <button onClick={(e) => {this.props.onSortQuestions(e.currentTarget.value)}} value="name" className="py-2 px-4 w-full h-full hover:bg-gray-200 text-left">Name</button>
                            </li>
                            <li>
                                <button onClick={(e) => {this.props.onSortQuestions(e.currentTarget.value)}} value="date" className="py-2 px-4 w-full h-full hover:bg-gray-200 text-left">Date Posted</button>
                            </li>
                            <li>
                                <button onClick={(e) => {this.props.onSortQuestions(e.currentTarget.value)}} value="user" className="py-2 px-4 w-full h-full hover:bg-gray-200 text-left">User</button>
                            </li>
                        </ul>
                    </div>
                ) : null}

            </div>
        );
    }
}

export default FilterDropdown;