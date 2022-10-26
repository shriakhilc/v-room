import { Classroom } from "@prisma/client";
import Link from "next/link";
import React from "react";
import ReplyBox from "./ReplyBox";

interface QuestionBoxProps {

} 

class QuestionBox extends React.Component<QuestionBoxProps, unknown> {

    constructor(props: QuestionBoxProps) {
        super(props);
    }

    render() {
        return( 
            <div className="p-4">   
                <div className="py-2 text-2xl text-red-500">
                    Hi there! this is test question title text.
                </div>
                <div className="py-2">
                    Hi there! this is test question body text.
                </div> 
                <ReplyBox nestings={0} MAX_NESTINGS={2}></ReplyBox>
            </div>
            );
    }
}

export default QuestionBox;