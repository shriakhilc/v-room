import { Answer, LikeType, Prisma, Question, User, UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowUp,
    faArrowDown
  } from "@fortawesome/free-solid-svg-icons";

interface ReplyBoxProps {
    nestings: number,
    MAX_NESTINGS: number,
    answer: Prisma.AnswerGetPayload<{
        include: {
            likes: true,
            user: true
        },
    }>,
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
    const [loadMore, setLoadMore] = useState(false);
    //const { data: answers, status: classroomStatus } = trpc.useQuery(['answer.nestedAnswers', { answerId: this.props.answer.answerId }]);

    const addToQuestion = trpc.useMutation('answer.addToQuestion');
    const addToAnswer = trpc.useMutation('answer.addToAnswer');
    const deleteAnswer = trpc.useMutation('answer.delete');
    const updateAnswer = trpc.useMutation('answer.update');
    const addLike = trpc.useMutation('likeAnswer.voteAnswer');
    const removeLike = trpc.useMutation('likeAnswer.removeVote');
    const updateLike = trpc.useMutation('likeAnswer.updateVote');
    const { data: answerChildren, status: answerChildrenStatus } = trpc.useQuery(['answer.nestedAnswers', { answerId: props.answer.answerId }]);

    const getCurrentLike = () => {
        const existingLike = props.answer.likes.find(like => like.userId === data?.user?.id);
        console.log(existingLike);
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

    const addAnswerToAnswer = async () => {
        await addToAnswer.mutateAsync(
            {
                parent_id: props.answer.answerId,
                userId: data?.user?.id as string,
                answerStr: replyText,
            },
            {
                onSuccess: (result) => {      
                    console.log(result);             
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
                    utils.invalidateQueries(["answer.nestedAnswers"]);
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
                    utils.invalidateQueries(["answer.nestedAnswers"]);
                },
                onError(error) {
                    // Forbidden error based on user role, should not occur normally since menu only visible to instructors
                    console.log(`Deleting answer ERROR: ${error}`);
                },
            }
        );
    }

    const updateLikeStatus = async (e: LikeType) => {
        const existingLike = props.answer.likes.find(like => like.userId === data?.user?.id);
        if(existingLike && existingLike.likeType === e) {
            setCurrentLike(0);
            await removeLike.mutateAsync( 
                {
                    userId: data?.user?.id as string,
                    answerId: props.answer.answerId,
                },
                {
                    onSuccess: () => {
                        utils.invalidateQueries(["question.byClassroom"]);
                        utils.invalidateQueries(["question.bySearchStr"]);
                        utils.invalidateQueries(["answer.nestedAnswers"]);
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
                    answerId: props.answer.answerId,
                    likeType: e
                },
                {
                    onSuccess: () => {
                        utils.invalidateQueries(["question.byClassroom"]);
                        utils.invalidateQueries(["question.bySearchStr"]);
                        utils.invalidateQueries(["answer.nestedAnswers"]);
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
                    answerId: props.answer.answerId,
                    likeType: e
                },
                {
                    onSuccess: () => {
                        utils.invalidateQueries(["question.byClassroom"]);
                        utils.invalidateQueries(["question.bySearchStr"]);
                        utils.invalidateQueries(["answer.nestedAnswers"]);
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
        return props.answer.likes.filter(like => like.likeType === LikeType.like).length;
    }

    const getDislikeCount = () => {
        return props.answer.likes.filter(like => like.likeType === LikeType.dislike).length;
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
                <div className="flex flex-row justify-between">
                    <div className="py-2 text-grey-200 border-t-2 text-gray-500 border-gray-300"><>Posted by {props.user.name} on {props.answer.createdAt.toLocaleDateString('en-US')}</></div>
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
                {(answerChildrenStatus == "success" && props.nestings < props.MAX_NESTINGS) && 
                    <ul>
                        {answerChildren.map(answer => (
                            <li className="p-1 m-auto" key={answer.answerId}>
                                <ReplyBox parent={props.answer} nestings={props.nestings + 1} MAX_NESTINGS={props.MAX_NESTINGS} answer={answer} user={answer.user} currentUserRole={props.currentUserRole} classroomActive={props.classroomActive}></ReplyBox>
                            </li>
                        ))}
                    </ul>
                }
                {(answerChildrenStatus == "success" && props.nestings == props.MAX_NESTINGS && loadMore) &&
                    <ul>
                        {answerChildren.map(answer => (
                            <li className="p-1 m-auto" key={answer.answerId}>
                                <ReplyBox parent={props.answer} nestings={props.nestings + 1} MAX_NESTINGS={props.MAX_NESTINGS+3} answer={answer} user={answer.user} currentUserRole={props.currentUserRole} classroomActive={props.classroomActive}></ReplyBox>
                            </li>
                        ))}
                    </ul>
                }
                {(props.nestings == props.MAX_NESTINGS && !loadMore) &&
                    <div>
                        <a className="text-red-500 hover:underline hover:cursor-pointer" onClick={ () => {setLoadMore(true)}}> Load more...</a>
                    </div>
                }

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
                            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded" onClick={() => {addAnswerToAnswer(); setReplying(false);}}>Submit</button>
                        }
                        {replyText == "" &&
                            <button disabled className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded">Submit</button>
                        }
                        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-2 rounded mx-2" onClick={() => setReplying(false)}>Cancel</button>
                    </div>
                }
            </div>
        </div>
    );
}