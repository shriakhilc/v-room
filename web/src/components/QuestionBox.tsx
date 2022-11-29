import { LikeType, Prisma, Question, User, UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { NextRouter } from "next/router";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import ReplyBox from "./ReplyBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowUp,
    faArrowDown
  } from "@fortawesome/free-solid-svg-icons";

interface QuestionBoxProps {
    question: Prisma.QuestionGetPayload<{
        include: {
            likes: true
        }
    }>,
    answers: Prisma.AnswerGetPayload<{
        include: {
            Children?: {
                include: {
                    likes: true
                }
            },
            likes: true,
            user: true
        },
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
    const addAnswer = trpc.useMutation('answer.addToQuestion');
    const deleteQuestion = trpc.useMutation('question.delete');
    const updateQuestion = trpc.useMutation('question.update');
    const addLike = trpc.useMutation('likeQuestion.voteQuestion');
    const removeLike = trpc.useMutation('likeQuestion.removeVote');
    const updateLike = trpc.useMutation('likeQuestion.updateVote');
    const utils = trpc.useContext();
    const { data, status } = useSession();

    const getCurrentLike = () => {
        const existingLike = props.question.likes.find(like => like.userId === data?.user?.id);
        if(existingLike && existingLike.likeType == LikeType.like) {
            return 1
        }
        else if(existingLike && existingLike.likeType == LikeType.dislike) {
            return -1;
        }
        else {
            return 0;
        }
    }

    const [currentLike, setCurrentLike] = useState(getCurrentLike());

    const addAnswerToQuestion = async () => {
        await addAnswer.mutateAsync(
            {
                questionId: props.question.questionId,
                userId: data?.user?.id as string,
                answerStr: replyText,
                parent_id: props.question.questionId,
            },
            {
                onSuccess: () => {
                    utils.invalidateQueries(["question.byClassroom"]);
                    utils.invalidateQueries(["question.bySearchStr"]);
                    utils.invalidateQueries(["answer.nestedAnswers"]);
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
                    utils.invalidateQueries(["answer.nestedAnswers"]);
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
                    utils.invalidateQueries(["answer.nestedAnswers"]);
                },
                onError(error) {
                    // Forbidden error based on user role, should not occur normally since menu only visible to instructors
                    console.log(`Updating question ERROR: ${error}`);
                },
            }
        );
    }

    const updateLikeStatus = async (e: LikeType) => {
        const existingLike = props.question.likes.find(like => like.userId === data?.user?.id);
        if(existingLike && existingLike.likeType === e) {
            setCurrentLike(0);
            await removeLike.mutateAsync( 
                {
                    userId: data?.user?.id as string,
                    questionId: props.question.questionId,
                },
                {
                    onSuccess: () => {
                        utils.invalidateQueries(["question.byClassroom"]);
                        utils.invalidateQueries(["question.bySearchStr"]);
                    },
                    onError(error) {
                        // Forbidden error based on user role, should not occur normally since menu only visible to instructors
                        console.log(`Removing vote ERROR: ${error}`);
                    },
                }
            );
        }
        else if(existingLike) {
            if(e === LikeType.like) {
                setCurrentLike(1);
            }
            else {
                setCurrentLike(-1);
            }
            await updateLike.mutateAsync( 
                {
                    userId: data?.user?.id as string,
                    questionId: props.question.questionId,
                    likeType: e
                },
                {
                    onSuccess: () => {
                        utils.invalidateQueries(["question.byClassroom"]);
                        utils.invalidateQueries(["question.bySearchStr"]);
                    },
                    onError(error) {
                        // Forbidden error based on user role, should not occur normally since menu only visible to instructors
                        console.log(`Updating vote ERROR: ${error}`);
                    },
                }
            );

        }
        else {
            if(e === LikeType.like) {
                setCurrentLike(1);
            }
            else {
                setCurrentLike(-1)
            }
            await addLike.mutateAsync( 
                {
                    userId: data?.user?.id as string,
                    questionId: props.question.questionId,
                    likeType: e
                },
                {
                    onSuccess: () => {
                        utils.invalidateQueries(["question.byClassroom"]);
                        utils.invalidateQueries(["question.bySearchStr"]);
                    },
                    onError(error) {
                        // Forbidden error based on user role, should not occur normally since menu only visible to instructors
                        console.log(`Adding vote ERROR: ${error}`);
                    },
                }
            );

        }
    }

    const getLikeCount = () => {
        return props.question.likes.filter(like => like.likeType === LikeType.like).length;
    }

    const getDislikeCount = () => {
        return props.question.likes.filter(like => like.likeType === LikeType.dislike).length;
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
            <div className="flex flex-row justify-between">
                <div className="py-2 text-md text-gray-500">
                    Asked by {props.user.name} on {props.question.createdAt.toLocaleDateString('en-US')}
                </div>
                <div className="text-red-500 flex flex-row align-center"> 
                    {currentLike <= 0 &&  
                        <FontAwesomeIcon
                            icon={faArrowUp}
                            onClick={ () => {updateLikeStatus(LikeType.like)}}
                            className="hover:bg-red-500 hover:cursor-pointer hover:text-white rounded p-1"
                        />
                    }
                    {currentLike == 1 &&
                        <FontAwesomeIcon
                        icon={faArrowUp}
                        onClick={ () => {updateLikeStatus(LikeType.like)}}
                        className="bg-red-500 hover:cursor-pointer text-white rounded p-1"
                        />
                    }
                    <div>&nbsp;{getLikeCount()}&nbsp;</div>
                    {currentLike >= 0 &&  
                        <FontAwesomeIcon
                            icon={faArrowDown}
                            onClick={ () => {updateLikeStatus(LikeType.dislike)}}
                            className="hover:bg-red-500 hover:cursor-pointer hover:text-white rounded p-1"
                        />
                    }
                    {currentLike == -1 &&
                        <FontAwesomeIcon
                        icon={faArrowDown}
                        onClick={ () => {updateLikeStatus(LikeType.dislike)}}
                        className="bg-red-500 hover:cursor-pointer text-white rounded p-1"
                        />
                    }
                    <div>&nbsp;{getDislikeCount()}&nbsp;</div>
                </div>
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