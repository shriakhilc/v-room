import { Prisma, Question, User, UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { NextRouter } from "next/router";
import { useState } from "react";
import { classroomRouter } from "../server/router/classroom";
import { trpc } from "../utils/trpc";
import ReplyBox from "./ReplyBox";

interface QuestionBoxProps {
    question: Question,
    answers: Prisma.AnswerGetPayload<{
        include: { user: true }
    }>[],
    user: User,
    router: NextRouter,
    currentUserRole: UserRole,
    classroomActive: boolean,
}

export default function QuestionBox(props: QuestionBoxProps) {

    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [questionText, setQuestionText] = useState(props.question.questionStr);
    const [questionTitle, setQuestionTitle] = useState(props.question.questionTitle);
    const [editing, setEditing] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const addAnswer = trpc.useMutation('answer.add');
    const deleteQuestion = trpc.useMutation('question.delete');
    const updateQuestion = trpc.useMutation('question.update');
    const utils = trpc.useContext();
    const { data, status } = useSession();

    const addAnswerToQuestion = async () => {
        await addAnswer.mutateAsync(
            {
                questionId: props.question.questionId,
                userId: data?.user?.id as string,
                answerStr: replyText,
            },
            {
                onSuccess: () => {
                    utils.invalidateQueries(["question.byClassroom"]);
                    utils.invalidateQueries(["question.bySearchStr"]);
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

    const onDeleteQuestion = async () => {
        await deleteQuestion.mutateAsync(
            {
                questionId: props.question.questionId,
            },
            {
                onSuccess: () => {
                    setDeleteConfirm(false);
                    utils.invalidateQueries(["question.byClassroom"]);
                    utils.invalidateQueries(["question.bySearchStr"]);
                },
                onError(error) {
                    // Forbidden error based on user role, should not occur normally since menu only visible to instructors
                    console.log(`Deleting question ERROR: ${error}`);
                },
            }
        );
    }

    const onUpdateQuestion = async () => {
        await updateQuestion.mutateAsync(
            {
                questionId: props.question.questionId,
                questionTitle: questionTitle,
                questionStr: questionText,
            },
            {
                onSuccess: () => {
                    setEditing(false)
                    utils.invalidateQueries(["question.byClassroom"]);
                    utils.invalidateQueries(["question.bySearchStr"]);
                },
                onError(error) {
                    // Forbidden error based on user role, should not occur normally since menu only visible to instructors
                    console.log(`Updating question ERROR: ${error}`);
                },
            }
        );
    }

    return (
        <div className="p-4 border-b-2 bg-gray-50 border rounded-md m-2">
            <div className="py-2 text-2xl text-gray-900 font-bold">
                {!editing && props.question.questionTitle}
                {editing &&
                    <div>
                        <textarea onChange={(e) => setQuestionTitle(e.currentTarget.value)} value={questionTitle} className="border rounded-md border-black min-w-full"></textarea>
                    </div>
                }
            </div>
            <div className="py-2 text-gray-900">
                {!editing && props.question.questionStr}
                {editing &&
                    <div>
                        <textarea onChange={(e) => setQuestionText(e.currentTarget.value)} value={questionText} className="border rounded-md border-black min-w-full"></textarea>
                    </div>
                }
            </div>
            <div className="py-2 text-md text-gray-500">
                Asked by {props.user.name} on {props.question.createdAt.toLocaleDateString('en-US')}
            </div>


            {props.answers.length > 0 &&
                <div>
                    <ul>
                        {props.answers.map(answer => (
                            <li className="p-1 m-auto" key={answer.answerId}>
                                <ReplyBox parent={props.question} nestings={0} MAX_NESTINGS={2} answer={answer} user={answer.user} currentUserRole={props.currentUserRole} classroomActive={props.classroomActive}></ReplyBox>
                            </li>
                        ))}
                    </ul>
                    {replying &&
                        <div className="p-2">
                            <textarea onChange={(e) => setReplyText(e.currentTarget.value)} value={replyText} placeholder="Type your answer..." className="text-gray-900 border rounded-md border-black min-w-full"></textarea>
                            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded" onClick={() => addAnswerToQuestion()}>Submit</button>
                            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded mx-2" onClick={() => setReplying(false)}>Cancel</button>
                        </div>
                    }
                </div>
            }
            {props.answers.length == 0 &&
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
            <div className="flex">
                {props.classroomActive &&
                    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded" onClick={() => setReplying(true)}>Add an Answer</button>
                }  
                <div className="flex flex-1 items-end justify-end">
                    {(!editing && (data?.user?.name == props.user.name || props.currentUserRole == UserRole.INSTRUCTOR)  && props.classroomActive) &&
                        <button onClick={() => setEditing(true)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded">Edit</button>
                    }
                    {editing &&
                        <button onClick={() => onUpdateQuestion()} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded">Confirm</button>
                    }
                    {(!deleteConfirm && (data?.user?.name == props.user.name || props.currentUserRole == UserRole.INSTRUCTOR)  && props.classroomActive) &&
                        <button onClick={() => setDeleteConfirm(true)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded mx-2">Delete</button>
                    }
                    {deleteConfirm &&
                        <button onClick={() => onDeleteQuestion()} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded mx-2">Click Again to Delete</button>
                    }
                </div>
            </div>
        </div>
    );
}