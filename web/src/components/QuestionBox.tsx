import { Answer, Classroom, Prisma, Question, User, UserRole } from "@prisma/client";
import Link from "next/link";
import React, { useState } from "react";
import { questionRouter } from "../server/router/question";
import { trpc } from "../utils/trpc";
import ReplyBox from "./ReplyBox";
import { withRouter, NextRouter } from "next/router";
import { timeUntilStale } from "react-query/types/core/utils";
import { useSession } from "next-auth/react";

interface QuestionBoxProps {
    question: Question,
    answers: Prisma.AnswerGetPayload<{
        include: { user: true }
    }>[],
    user: User,
    router: NextRouter,
    currentUserRole: UserRole,
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
    const {data, status} = useSession();

    const addAnswerToQuestion = async () => {
        await addAnswer.mutateAsync(
            {
              questionId: props.question.questionId,
              userId: props.user.id,
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

    return( 
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
                Asked by {props.user.name}
            </div>


            { props.answers.length > 0 &&
                <ul>
                    {props.answers.map(answer => (
                        <li className="p-1 m-auto" key={answer.answerId}>
                            <ReplyBox parent={props.question} nestings={0} MAX_NESTINGS={2} answer={answer} user={answer.user} currentUserRole={props.currentUserRole}></ReplyBox>
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
            <div className="flex">
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded" onClick={() => setReplying(true)}>Add an Answer</button> 
                <div className="flex flex-1 items-end justify-end">
                    { (!editing && (data?.user?.name == props.user.name || props.currentUserRole == UserRole.INSTRUCTOR)) &&
                        <button onClick={() => setEditing(true)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded">Edit</button>
                    }
                    { editing && 
                        <button onClick={() => onUpdateQuestion()} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded">Confirm</button>
                    }
                    { (!deleteConfirm && (data?.user?.name == props.user.name || props.currentUserRole == UserRole.INSTRUCTOR)) &&
                        <button onClick={() => setDeleteConfirm(true)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded mx-2">Delete</button>
                    }
                    { deleteConfirm && 
                        <button onClick={() => onDeleteQuestion()} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded mx-2">Click Again to Delete</button>
                    }
                </div>
            </div>
        </div>
    );
}