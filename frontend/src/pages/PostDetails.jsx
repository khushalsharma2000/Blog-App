import { useNavigate, useParams } from "react-router-dom";
import Comment from "../components/Comment";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { BiEdit } from 'react-icons/bi';
import { MdDelete } from 'react-icons/md';
import axios from "axios";
import { URL, IF } from "../url";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import Loader from "../components/Loader";

const PostDetails = () => {
  const postId = useParams().id;
  const [post, setPost] = useState({});
  const { user } = useContext(UserContext);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [loader, setLoader] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();

  const fetchPost = async () => {
    try {
      const res = await axios.get(URL + "/api/posts/" + postId);
      setPost(res.data);
      checkIfFollowing(res.data.userId);
    } catch (err) {
      console.log(err);
    }
  };

  const checkIfFollowing = async (profileId) => {
    try {
      
      const token = sessionStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const res = await axios.post(URL + "/api/users/isFollowing", {
        userId: user.user_id,
        profileId: profileId,
      }, { headers: headers });
      setIsFollowing(res.data.isFollowing);
    } catch (err) {
      console.log(err);
    }
  };

  const handleFollow = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      await axios.post(URL + "/api/users/follow", {
        userId: user.user_id,
        profileId: post.userId,
      }, { headers: headers });
      setIsFollowing(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleUnfollow = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      await axios.post(URL + "/api/users/unfollow", {
        userId: user.user_id,
        profileId: post.userId,
      }, { headers: headers });
      setIsFollowing(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeletePost = async () => {
    try {
      await axios.delete(URL + "/api/posts/" + postId, { withCredentials: true });
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId, user]);

  const fetchPostComments = async () => {
    setLoader(true);
    try {
      const res = await axios.get(URL + "/api/comments/post/" + postId);
      setComments(res.data);
      setLoader(false);
    } catch (err) {
      setLoader(true);
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPostComments();
  }, [postId]);

  const postComment = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      await axios.post(URL + "/api/comments/create",
        { comment: comment, author: user.username, postId: postId, userId: user._id },
        { headers: headers });
      window.location.reload(true);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <Navbar />
      {loader ? <div className="h-[80vh] flex justify-center items-center w-full "><Loader /></div> : <div className="px-8 md:px-[200px] mt-8  bg-orange-400">
        <div className="flex justify-between items-center  ">
          <h1 className="text-2xl font-bold text-black md:text-3xl">{post.title}</h1>
          {user?._id === post?.userId && <div className="flex items-center justify-center space-x-2">
            <p className="cursor-pointer" onClick={() => navigate("/edit/" + postId)} ><BiEdit /></p>
            <p className="cursor-pointer" onClick={handleDeletePost}><MdDelete /></p>
          </div>}
        </div>
        <div className="flex items-center space-x-4 mt-8  ">
          <p>@{post.username}</p>
          {user && user.user_id !== post.userId && (isFollowing ? (
            <button
              onClick={handleUnfollow}
              className="text-white font-semibold bg-red-500 px-4 py-2 hover:text-black"
            >
              Unfollow
            </button>
          ) : (
            <button
              onClick={handleFollow}
              className="text-white font-semibold bg-black px-4 py-2 hover:text-black hover:bg-gray-400"
            >
              Follow
            </button>)
          )}
        </div>
        <img src={IF + post.photo} className="w-full mx-auto mt-8 " alt="" />
        <p className="mx-auto mt-8">{post.desc}</p>
        <div className="flex items-center mt-8 space-x-4 font-semibold">
          <p>Categories:</p>
          <div className="flex justify-center items-center space-x-2">
            {post.categories?.map((c, i) => (
              <div key={i} className="bg-gray-300 rounded-lg px-3 py-1">{c}</div>
            ))}
          </div>
        </div>
        <div className="flex flex-col mt-4">
          <h3 className="mt-6 mb-4 font-semibold">Comments:</h3>
          {comments?.map((c) => (
            <Comment key={c._id} c={c} post={post} />
          ))}
        </div>
        <div className="w-full flex flex-col mt-4 md:flex-row ">
        <input
  onChange={(e) => setComment(e.target.value)}
  type="text"
  placeholder="Write a comment"
  className="md:w-[80%] outline-none py-2 px-4 mt-4 md:mt-0"
  style={{ backgroundColor: 'blue' }}
/>

          <button onClick={postComment} className="bg-black text-sm text-white px-2 py-2 md:w-[20%] mt-4 md:mt-0">Add Comment</button>
        </div>
      </div>}
      <Footer />
    </div>
  );
}

export default PostDetails;
