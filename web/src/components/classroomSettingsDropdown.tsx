import { Classroom } from "@prisma/client";
import Link from "next/link";
import React, { useCallback } from "react";

interface DropdownProps {
    onDeleteClassroom: () => void,
    onArchiveClassroom: () => void,
}

interface DropdownState {
    open: boolean,
}

class ClassroomSettingsDropdown extends React.Component<DropdownProps, DropdownState> {
    state = { open: false };

    handleOpen = () => {
        this.setState((state) => ({
            open: !state.open,
        }))
    };

    render() {
        return (
            <div className="relative m-auto">
                <button onClick={this.handleOpen} id="dropdownMenuIconButton" data-dropdown-toggle="dropdownDots" className="inline-flex items-center p-2 text-sm font-medium text-center text-white rounded-lg focus:ring-2 focus:outline-nonetext-white hover:bg-gray-700 focus:ring-gray-600" type="button">
                    <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                </button>

                {this.state.open ? (
                    <div id="dropdownDots" className="absolute right-1/2 z-10 w-40 bg-white rounded shadow-md">
                        <ul className="text-sm text-gray-700" aria-labelledby="dropdownMenuIconButton">
                            <li>
                                <button onClick={this.props.onArchiveClassroom} className="py-2 px-4 w-full h-full hover:bg-gray-200 text-left">Archive Classroom</button>
                            </li>
                            <li>
                                <button onClick={this.props.onDeleteClassroom} className="py-2 px-4 w-full h-full bg-red-500 text-white hover:bg-red-700 text-left">Delete Classroom</button>
                            </li>
                        </ul>
                    </div>
                ) : null}

            </div>
        );
    }
}

export default ClassroomSettingsDropdown;