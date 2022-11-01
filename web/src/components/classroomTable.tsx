import { UserRole } from "@prisma/client";
import Link from "next/link";
import React from "react";
import { inferQueryOutput } from "../utils/trpc";

interface ClassroomTableProps {
    classrooms: inferQueryOutput<'user.getClassrooms'>,
}

class ClassroomTable extends React.Component<ClassroomTableProps, unknown> {
    render() {
        return (
            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="align-middle min-w-full">
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
                                            Department
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Course Number
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            CRN
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Status
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Your Role
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Invite Code
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {this.props.classrooms.map(({ classroom, role }) => (
                                        <tr key={classroom.id}>
                                            <Link href={`/classroom/${classroom.id}`}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900 hover:text-blue-500 cursor-pointer">
                                                    <a>{classroom.name}</a>
                                                </td>
                                            </Link>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {classroom.department}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {classroom.courseNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {classroom.crn}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5
                                            font-semibold rounded-full ${classroom.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                                >
                                                    {classroom.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                                                {role}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {role == UserRole.INSTRUCTOR ? classroom.inviteCode : "Instructors only"}
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

export default ClassroomTable;