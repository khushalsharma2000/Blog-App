import { useContext, useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ProfilePosts from "../components/ProfilePosts";
import axios from "axios";
import { IF, URL } from "../url";
import { UserContext } from "../context/UserContext";
import { useNavigate, useParams } from "react-router-dom";

const Profile = () => {
  const param = useParams().id;
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [updated, setUpdated] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(URL + "/api/users/" + user.user_id);
      setUsername(res.data.username);
      setEmail(res.data.email);
      setIsFollowing(res.data.isFollowing); // Assuming backend returns whether the current user is following this profile
    } catch (err) {
      console.log(err);
    }
  };

  
  const getFollower=async()=>{
    try{
      const token = sessionStorage.getItem('token')
          const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          };
      const res=await axios.post(URL+"/api/users/getfollowers",{userId: user.user_id},{headers:headers})
      
      setFollowers(res.data.num)
      
      
      

    }
    catch(err){
      
      console.log(err)

    }

  }

  // Function to handle follow
 

  // const handleUserDelete = async () => {
  //   try {
  //     const res = await axios.delete(URL + "/api/users/" + user._id, {
  //       withCredentials: true,
  //     });
  //     setUser(null);
  //     navigate("/");
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  const fetchUserPosts = async () => {
    try {
      const res = await axios.get(URL + "/api/posts/user/" + user.user_id);
      setPosts(res.data);
      
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    // fetchProfile();
    fetchUserPosts();
    getFollower();
    
    
  }, [param, user]);

  return (
    <div>
      <Navbar />
      <div className="min-h-[80vh] px-8 md:px-[200px] mt-8 flex md:flex-row flex-col-reverse md:items-start items-start  bg-orange-400">
        <div className="flex flex-col md:w-[70%] w-full mt-8 md:mt-0">
          <h1 className="text-xl font-bold mb-4">Your posts:</h1>
          {posts?.map((p) => (
            <ProfilePosts key={p._id} p={p} />
          ))}
        </div>
        <div className="md:sticky md:top-12 flex justify-start md:justify-end items-start md:w-[30%] w-full md:items-end">
          <div className="flex flex-col space-y-4 items-start bg-white p-4 rounded shadow-md">
            <h1 className="text-2xl font-bold mb-4">Profile</h1>
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 text-white rounded-full h-12 w-12 flex items-center justify-center">
                {followers}
              </div>
              <div className="text-lg font-medium">Followers</div>
            </div>
            {/* Optionally, you can add more profile details here */}
            {updated && (
              <h3 className="text-green-500 text-sm text-center mt-4">
                User updated successfully!
              </h3>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};


export default Profile;
