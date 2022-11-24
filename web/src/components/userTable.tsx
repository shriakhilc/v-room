import { UserRole } from "@prisma/client";
import React from "react";
import { inferQueryOutput } from '@/src/utils/trpc';


interface UserTableProps {
    users: inferQueryOutput<'classroom.sectionedUsers'>,
    currentUserRole: UserRole,
    onAddUser: (userId: string, role: UserRole) => Promise<void>,
    onRemoveUser: (userId: string) => Promise<void>,
    classroomActive: boolean,
}

class UserTable extends React.Component<UserTableProps, { selectedRole: UserRole }> {
    constructor(props: UserTableProps) {
        super(props);
        this.state = {
            selectedRole: UserRole.STUDENT,
        }
    }

    render() {
        return (
            <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle min-w-full sm:px-6 lg:px-8">
                        <div className="shadow border-b border-gray-200 sm:rounded-lg overflow-auto max-h-[50rem]">
                            <table className="min-w-full max-h-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Name
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Email
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Role
                                        </th>

                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Add</span>
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Remove</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {this.props.users.enrolled.map(({ user, role }) =>
                                    (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {user.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-900 uppercase">
                                                {role}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {/* TODO: Use a Button, button styling for <a>, or use Link; whatever best practice might be */}
                                                {(this.props.currentUserRole == UserRole.INSTRUCTOR && this.props.classroomActive) &&
                                                    <a onClick={async () => await this.props.onRemoveUser(user.id)} href="#" className="text-red-600 hover:text-red-900">
                                                        Remove
                                                    </a>
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {/* Empty cell since no Add action on these users */}
                                            </td>
                                        </tr>
                                    ))}
                                    {this.props.users.unenrolled.map((user) =>
                                    (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {user.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-900 uppercase">
                                                NONE
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {/* Empty cell since no Remove action on these users */}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {(this.props.currentUserRole == UserRole.INSTRUCTOR && this.props.classroomActive) &&
                                                    <div className="text-gray-900">
                                                        {/* TODO: Use a Button, button styling for <a>, or use Link; whatever best practice might be */}
                                                        <a onClick={async () => await this.props.onAddUser(user.id, this.state.selectedRole)} href="#" className="text-green-600 hover:text-green-900">
                                                            Add
                                                        </a>
                                                        &nbsp;as&nbsp;
                                                        {/* TODO FIX: Bug: if user directly presses add without clicking on role, previous role state gets applied */}
                                                        <select name="roles" id="roles" className="text-gray-900">
                                                            {/* TODO is "value" needed if we won't use it? Can we use it somehow? */}
                                                            <option value="student" onClick={() => { this.setState({ selectedRole: UserRole.STUDENT }) }}>Student</option>
                                                            <option value="assistant" onClick={() => { this.setState({ selectedRole: UserRole.ASSISTANT }) }}>Assistant</option>
                                                            <option value="instructor" onClick={() => { this.setState({ selectedRole: UserRole.INSTRUCTOR }) }}>Instructor</option>
                                                        </select>
                                                    </div>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default UserTable;