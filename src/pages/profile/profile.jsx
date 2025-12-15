import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./profile.module.css";

import { changeUser, getAllUserPosts, handlePostComment, handlePostLike } from "../../functions/functions";
import SidePanel from "../../components/sidePanel";

export default function Profile(){

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [userPosts, setUserPosts] = useState(null);

    const [showBigPostWindow, setShowBigPostWindow] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [commentBody, setCommentBody] = useState("");

    //CHECK IF LOGGED IN
    useEffect(() => {
        const getUserPosts = async (session) => {
            const posts = await getAllUserPosts(session.user_id);
            // console.log(posts);
            setUserPosts(posts);
        }
        const session = localStorage.getItem('session');
        if (!session) navigate("/");

        //SESSION USER EXISTS, STORE IT IN 'USER'
        setUser(JSON.parse(session))
        getUserPosts(JSON.parse(session));
        
    }, []);

    //OPEN BIG POST WINDOW
    const handleBigPostWindow = (post) => {
        setSelectedPost(post);
        setShowBigPostWindow(true);
    };

    //HANDLE LIKE/DISLIKE OF POST
    const handleLike = async () => {
        if(selectedPost?.users_liked.includes(user?.user_id)){
            const updatedPost = await handlePostLike(selectedPost?.key, "DISLIKE", user?.user_id);
            setSelectedPost(updatedPost);

            const updatedPosts = await getAllUserPosts(user?.user_id);
            setUserPosts(updatedPosts);
        } else {
            const updatedPost = await handlePostLike(selectedPost?.key, "LIKE", user?.user_id);
            setSelectedPost(updatedPost);

            const updatedPosts = await getAllUserPosts(user?.user_id);
            setUserPosts(updatedPosts);
        }
    };

    //HANDLE POSTING COMMENTS
    const postComment = async () => {
        if (commentBody === "") return console.log("Comment must have substance");
        const updatedPost = await handlePostComment(selectedPost?.key, "COMMENTS", user?.user_id, user?.nickname, commentBody);
        setSelectedPost(updatedPost);
        setCommentBody("");
    }

    return(
        <div className={styles.page}>
            <SidePanel />
            <div className={styles.pageContent}>
                <div className={styles.profileContainer}>
                    <img src="/profile.png" alt="img" />
                    <div className={styles.profileInnerContainer}>
                        <h1>{user?.username}</h1>
                        <p>{user?.nickname}</p>
                        <div style={{display: "flex", gap: "10px"}}>
                            <p style={{cursor: "pointer"}}>{user?.followers.length} followers</p>
                            <p style={{cursor: "pointer"}}>{user?.following.length} following</p>
                        </div>
                        <p>Bio: {user?.bio}</p>
                        {/* <button onClick={() => setShowSettings(true)}>Edit profile</button> */}
                    </div>
                </div>

                <h2 style={{textDecoration: "underline"}}>Posts</h2>

                {/* MAP OF THE USER'S POSTS */}
                <div className={styles.postsMapContainer}>
                    {userPosts !== null && ([...userPosts].sort((a, b) => b.key - a.key).map((posts, i) => (
                        <div key={i} onClick={() => handleBigPostWindow(posts)}>
                            <h3>{posts?.image_id}</h3>
                            <p>{posts?.description}</p>
                        </div>
                    )))}
                </div>
                {showBigPostWindow && (
                    <div onClick={() => setShowBigPostWindow(false)} className={styles.bigPostWindowWrapper}>
                        <div onClick={(e) => e.stopPropagation()} className={styles.bigPostWindow}>
                            <h2>{selectedPost?.image_id}</h2>
                            <p>{selectedPost?.description}</p>
                            <div className={styles.spacer}/>
                            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", marginBottom: "16px"}}>
                                <p style={{margin: 0, fontSize: "14px", fontWeight: "600", color: "var(--text-primary)"}}>{selectedPost?.users_liked.length} likes</p>
                                <button onClick={() => handleLike()}>{selectedPost?.users_liked.includes(user?.user_id) ? "Dislike" : "Like"}</button>
                            </div>

                            <div className={styles.spacer}/>

                            <div className={styles.commentsArea}>
                                {selectedPost?.comments?.length > 0 && ([...selectedPost.comments].sort((a, b) => b.key - a.key).map((comment, i) => (
                                    <div key={i}>
                                        <p><img src="/profile.png" alt="profile"/>{comment?.nickname}</p>
                                        <p>{comment?.body}</p>
                                    </div>
                                )))}
                            </div>
                            
                            <form className={styles.commentInputField} onSubmit={(e) => {e.preventDefault(); postComment()}}>
                                <input value={commentBody} type="text" placeholder="Add a comment..." onChange={(e) => setCommentBody(e.target.value)}/>
                                <button type="submit">Post</button>
                            </form>
                        </div>
                    </div>
                )}













                {/* {showSettings && (
                    <div className={styles.settingsWrapper}>
                        <div className={styles.settingsContainer}>
                            <p>Nickname</p>
                            <input type="text" placeholder="nickname" onChange={(e) => setNickname(e.target.value)}/>
                            <p>Bio</p>
                            <textarea type="text" placeholder="bio" rows={3} cols={50} onChange={(e) => setBio(e.target.value)}/>
                            <p>first name</p>
                            <input type="text" placeholder="firstname" onChange={(e) => setFirstname(e.target.value)}/>
                            <p>last name</p>
                            <input type="text" placeholder="lastname" onChange={(e) => setLastname(e.target.value)}/>
                            <div>
                                <button onClick={() => cancelChanges()}>Cancel</button>
                                <button>Save changes</button>
                            </div>
                        </div>
                    </div>
                )} */}
            </div>
        </div>
    );
};