import { Classroom } from "@prisma/client";
import Link from "next/link";
import React from "react";

interface ReplyBoxProps {
    nestings: number,
    MAX_NESTINGS: number,
} 

class ReplyBox extends React.Component<ReplyBoxProps, unknown> {

    constructor(props: ReplyBoxProps) {
        super(props);
    }

    render() {
        return( 
            <div className="p-">
                <div className="text-gray-900 p-4 shadow-gray-900 shadow-md bg-gray-50 border-b border-gray-200 sm:rounded-lg overflow-auto max-h-[50rem]">
                    <p className="py-2">Hi there! this is the text of a minimally-styled test reply. It is a reply to the text directly above. There will be a list of replies like this below, on the same nesting level. Replies indented slightly are replies to this text, and will be listed first.</p>
                    <p className="py-2">The posting user's name will go here.</p>
                    <p className="border-t py-2 border-gray-400">There will be a reply button here.</p> 
                    <textarea placeholder="Replies to this will go here. This will not be visible unless the user clicks the reply button." className="border rounded-md border-black min-w-full"></textarea>
                    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded">This button will submit the reply.</button>
                    {this.props.nestings < this.props.MAX_NESTINGS &&
                        <ReplyBox nestings={(this.props.nestings + 1)} MAX_NESTINGS={this.props.MAX_NESTINGS}></ReplyBox>
                    }
                </div>
            </div>
            );
    }
}

export default ReplyBox;