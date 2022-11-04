import { Answer, Classroom, Prisma, Question, User } from "@prisma/client";
import Link from "next/link";
import React, { useState } from "react";
import { questionRouter } from "../server/router/question";
import { trpc } from "../utils/trpc";
import ReplyBox from "./ReplyBox";
import { withRouter, NextRouter } from "next/router";
import { timeUntilStale } from "react-query/types/core/utils";

interface QuestionBoxProps {
    question: Question,
    answers: Prisma.AnswerGetPayload<{
        include: { user: true }
    }>[],
    user: User,
    router: NextRouter
} 

export default function QuestionBox(props: QuestionBoxProps) {

    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const addAnswer = trpc.useMutation('answer.add');
    const utils = trpc.useContext();

    const addAnswerToQuestion = async () => {
        await addAnswer.mutateAsync(
            {
              questionId: props.question.questionId,
              userId: props.user.id,
              answerStr: replyText,
            },
            {
              onSuccess: () => {
                //TEMPORARY
                window.location.reload();
              },
              onError(error) {
                // Forbidden error based on user role, should not occur normally since menu only visible to instructors
                console.log(`Adding answer: ERROR: ${error}`);
              },
            }
          );
        setReplyText("");
        setReplying(false);
    }

    return( 
        <div className="p-4 border-b-2 bg-gray-50 border rounded-md m-2">   
            <div className="py-2 text-2xl text-gray-900 font-bold">
                {props.question.questionTitle}
            </div>
            <div className="py-2 text-gray-900">
                {props.question.questionStr}
            </div> 
            <div className="py-2 text-md text-gray-500">
                Asked by {props.user.name}
            </div>
            { props.answers.length > 0 &&
                <ul>
                    {props.answers.map(answer => (
                        <li className="p-1 m-auto" key={answer.answerId}>
                            <ReplyBox parent={props.question} nestings={0} MAX_NESTINGS={2} answer={answer} user={answer.user}></ReplyBox>
                        </li>
                    ))}
                </ul>
            }
            { props.answers.length == 0 &&
                <div className="p-">
                    <div className="text-gray-900 p-4 shadow-gray-900 shadow-md bg-gray-50 border-b border-gray-200 sm:rounded-lg overflow-auto max-h-[50rem]">
                        <p className="py-2">There are no answers to this question - yet!</p>
                        {replying && 
                            <div>
                                <textarea onChange={(e) => setReplyText(e.currentTarget.value)} value={replyText} placeholder="Type your answer..." className="border rounded-md border-black min-w-full"></textarea>
                                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded" onClick={() => addAnswerToQuestion()}>Submit</button>
                                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded mx-2" onClick={() => setReplying(false)}>Cancel</button>
                            </div>
                        }
                    </div>
                </div>
            }
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded" onClick={() => setReplying(true)}>Add an Answer</button> 
        </div>
    );
}