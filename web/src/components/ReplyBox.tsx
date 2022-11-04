import { Answer, Classroom, Question, User } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { trpc } from "../utils/trpc";

interface ReplyBoxProps {
    nestings: number,
    MAX_NESTINGS: number,
    answer: Answer,
    user: User,
    parent: Question | Answer,
}

interface ReplyBoxState {
    replying: boolean,
    replyText: string,
}

export default function ReplyBox(props: ReplyBoxProps) {

    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const router = useRouter();
    //const { data: answers, status: classroomStatus } = trpc.useQuery(['answer.nestedAnswers', { answerId: this.props.answer.answerId }]);

    const addAnswer = trpc.useMutation('answer.add');

    const addAnswerToQuestion = async () => {
        await addAnswer.mutateAsync(
            {
              questionId: props.parent.questionId,
              userId: props.user.id,
              answerStr: replyText,
            },
            {
              onSuccess: () => router.replace(router.asPath),
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
        <div className="p-">
            <div className="text-gray-900 p-4 shadow-gray-900 shadow-md bg-gray-50 border-b border-gray-200 sm:rounded-lg overflow-auto max-h-[50rem]">
                <p className="py-2">{props.answer.answerStr}</p>
                <p className="py-2 text-grey-200 border-t-2 text-gray-500 border-gray-300"><>Posted by {props.user.name}</></p>
                {!replying && 
                    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded" onClick={() => setReplying(true)}>Reply to this Answer</button> 
                }
                {replying && 
                    <div>
                        <textarea onChange={(e) => setReplyText(e.currentTarget.value)} value={replyText} placeholder="Type your answer..." className="border rounded-md border-black min-w-full"></textarea>
                        {replyText != "" && 
                            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded" onClick={() => setReplying(false)}>Submit</button>
                        }
                        {replyText == "" && 
                            <button disabled className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded" onClick={() => addAnswerToQuestion()}>Submit</button>
                        }
                        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded mx-2" onClick={() => setReplying(false)}>Cancel</button>
                    </div>
                }
                {/*{(this.props.nestings < this.props.MAX_NESTINGS && answers != undefined) &&
                    <ul>
                        {answers.map(answer => (
                            <li key={answer.answerId}>
                                <ReplyBox nestings={this.props.nestings+1} MAX_NESTINGS={this.props.MAX_NESTINGS} answer={answer} user={answer.user}></ReplyBox>
                            </li>
                        ))}
                    </ul>
                }*/}
            </div>
        </div>
    );
}