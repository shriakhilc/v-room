import { Classroom, User } from "@prisma/client";
import { NextRouter } from "next/router";
import React from "react";


interface UserTableProps {
    users: User[];
    userRoles: string[];
    classroom: Classroom;
    router: NextRouter;
} 

class UserTable extends React.Component<UserTableProps, {selectedRole: string}> {
    constructor(props: UserTableProps) {
        super(props);
        this.state = {
            selectedRole: "student",
        }
    }
    
    async addUserToClassroom(user: User) {
        //TODO: Make this add with other than student
        const created = await fetch('../api/classrooms/users/add', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            "userId": user.id,
            "classroomId": this.props.classroom.id,
            "role": this.state.selectedRole
          })
        });
        const readable = await created.json();
        console.log(readable);
        if(created.status == 200) {
            this.props.router.replace(this.props.router.asPath);
        }
        else {
          console.log(created);
        }
    }
    
    async removeUserFromClassroom(user: User, role: string) {
        console.log("Removing");
        const removed = await fetch('../api/classrooms/users/remove', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            "userId": user.id,
            "classroomId": this.props.classroom.id,
            "role": role.toLowerCase()
          })
        });
        const readable = await removed.json();
        console.log(readable);
        if(removed.status == 200) {
            this.props.router.replace(this.props.router.asPath);
        }
        else {
          console.log(removed);
        }
    }

    render() {
        return (
            <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle min-w-full sm:px-6 lg:px-8">
                        <div className="shadow border-b border-gray-200 sm:rounded-lg overflow-auto max-h-[50rem] min-h-[50rem]">
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
                                    {this.props?.users?.map((user, index) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {user.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {user.email}    
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {this.props.userRoles[index]}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {this.props.userRoles[index] != "None" &&
                                                <a onClick={() => this.removeUserFromClassroom(user, this.props.userRoles[index] as string)} href="#" className="text-red-600 hover:text-red-900">
                                                    Remove
                                                </a>
                                            }   
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {this.props.userRoles[index] == "None" &&
                                                <div className="text-gray-900">
                                                    <a onClick={() => this.addUserToClassroom(user)} href="#" className="text-green-600 hover:text-green-900">
                                                        Add
                                                    </a>
                                                    &nbsp;as&nbsp; 
                                                    <select name="cars" id="cars" className="text-gray-900">
                                                        <option value="student" onClick={() => { this.setState({selectedRole: "student"})}}>Student</option>
                                                        <option value="assistant" onClick={() => { this.setState({selectedRole: "assistant"})}}>Assistant</option>
                                                        <option value="instructor" onClick={() => { this.setState({selectedRole: "instructor"})}}>Instructor</option>
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