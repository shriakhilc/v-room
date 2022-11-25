import { Answer, Question, User, UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { trpc } from "../utils/trpc";

interface ReplyBoxProps {
    nestings: number,
    MAX_NESTINGS: number,
    answer: Answer,
    user: User,
    parent: Question | Answer,
    currentUserRole: UserRole,
    classroomActive: boolean,
}

export default function ReplyBox(props: ReplyBoxProps) {

    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [answerText, setAnswerText] = useState(props.answer.answerStr);
    const [editing, setEditing] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const router = useRouter();
    const utils = trpc.useContext();
    const { data, status } = useSession();
    //const { data: answers, status: classroomStatus } = trpc.useQuery(['answer.nestedAnswers', { answerId: this.props.answer.answerId }]);

    const addToQuestion = trpc.useMutation('answer.addToQuestion');
    const addToAnswer = trpc.useMutation('answer.addToAnswer');
    const deleteAnswer = trpc.useMutation('answer.delete');
    const updateAnswer = trpc.useMutation('answer.update');

    const addAnswerToQuestion = async () => {
        await addToQuestion.mutateAsync(
            {
                questionId: (props.parent as Question).questionId,
                userId: props.user.id,
                answerStr: replyText,
                parent_id: (props.parent as Question).questionId,
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

    const addAnswerToAnswer = async () => {
        await addToAnswer.mutateAsync(
            {
                parent_id: (props.parent as Answer).answerId,
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

    const onUpdateAnswer = async () => {
        await updateAnswer.mutateAsync(
            {
                answerId: props.answer.answerId,
                answerStr: answerText,
            },
            {
                onSuccess: () => {
                    setEditing(false);
                    utils.invalidateQueries(["question.byClassroom"]);
                    utils.invalidateQueries(["question.bySearchStr"]);
                },
                onError(error) {
                    // Forbidden error based on user role, should not occur normally since menu only visible to instructors
                    console.log(`Updating Answer ERROR: ${error}`);
                },
            }
        );
    }

    const onDeleteAnswer = async () => {
        await deleteAnswer.mutateAsync(
            {
                answerId: props.answer.answerId,
            },
            {
                onSuccess: () => {
                    setDeleteConfirm(false)
                    utils.invalidateQueries(["question.byClassroom"]);
                    utils.invalidateQueries(["question.bySearchStr"]);
                },
                onError(error) {
                    // Forbidden error based on user role, should not occur normally since menu only visible to instructors
                    console.log(`Deleting answer ERROR: ${error}`);
                },
            }
        );
    }

    return (
        <div className="p-">
            <div className="text-gray-900 p-4 shadow-gray-900 shadow-md bg-gray-50 border-b border-gray-200 sm:rounded-lg overflow-auto max-h-[50rem]">
                {!editing &&
                    <p className="py-2">{props.answer.answerStr}</p>
                }
                {editing &&
                    <div>
                        <textarea onChange={(e) => setAnswerText(e.currentTarget.value)} value={answerText} className="border rounded-md border-black min-w-full"></textarea>
                    </div>
                }
                <p className="py-2 text-grey-200 border-t-2 text-gray-500 border-gray-300"><>Posted by {props.user.name} on {props.answer.createdAt.toLocaleDateString('en-US')}</></p>
                {!replying &&
                    <div className="flex">
                        {props.classroomActive &&
                            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded" onClick={() => setReplying(true)}>Reply to this Answer</button>
                        }
                        <div className="flex flex-1 items-end justify-end">
                            {(!editing && (data?.user?.name == props.user.name || props.currentUserRole == UserRole.INSTRUCTOR) && props.classroomActive) &&
                                <button onClick={() => setEditing(true)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded">Edit</button>
                            }
                            {editing &&
                                <button onClick={() => onUpdateAnswer()} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded">Confirm</button>
                            }
                            {(!deleteConfirm && (data?.user?.name == props.user.name || props.currentUserRole == UserRole.INSTRUCTOR) && props.classroomActive) &&
                                <button onClick={() => setDeleteConfirm(true)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded mx-2">Delete</button>
                            }
                            {deleteConfirm &&
                                <button onClick={() => onDeleteAnswer()} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded mx-2">Click Again to Delete</button>
                            }
                        </div>
                    </div>
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