import axios from "axios"
import Footer from "../components/Footer"
import HomePosts from "../components/HomePosts"
import Navbar from "../components/Navbar"
import { IF, URL } from "../url"
import { useContext, useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import Loader from '../components/Loader'
import { UserContext } from "../context/UserContext"
 

const Home = () => {
  
  const {search}=useLocation()
  const query=new URLSearchParams(search)
  // const navigate = useNavigation()
  // console.log(search)
  const [posts,setPosts]=useState([])
  const [noResults,setNoResults]=useState(false)
  const [loader,setLoader]=useState(false)
  const {user}=useContext(UserContext)
  // console.log(user)

  const fetchPosts=async()=>{
    setLoader(true)
    try{
      const res=await axios.get(URL+"/api/posts/"+ search)
      console.log(res.data)
      setPosts(res.data)
      if(res.data.length===0){
        setNoResults(true)
      }
      else{
        setNoResults(false)
      }
      setLoader(false)
      
    }
    catch(err){
      console.log(err)
      setLoader(true)
    }
  }

  useEffect(()=>{
    // if(sessionStorage.getItem("token")){
    //   // setUser(sessionStorage.getItem("user"));
      
    // }
    const token = query.get("token");
    if(token){
      sessionStorage.setItem("token",token);
      const { protocol, host, pathname } = window.location;
            window.history.replaceState({}, document.title, `${protocol}//${host}${pathname}`);
      // navigate("/");
    }
    // const token1 = sessionStorage.getItem('token');
    //     if (token1) {
    //         axios.get('https://slack.com/api/users.profile.get', {
    //             headers: {
    //                 Authorization: `Bearer ${token1}`
    //             }
    //         }).then(response => {
    //             setUser(response.data.profile);
    //         }).catch(error => {
    //             console.error('Error fetching user info:', error);
    //         });
    //     }
    fetchPosts()

  },[search])



  return (
    
    <>
    <Navbar/>
<div className="px-8 md:px-[200px] min-h-[80vh] bg-orange-400">
        {loader?<div className="h-[40vh] flex justify-center items-center"><Loader/></div>:!noResults?
        posts.map((post)=>(
          <>
          <Link to={user?`/posts/post/${post._id}`:"/login"}>
          <HomePosts key={post._id} post={post}/>
          </Link>
          </>
          
        )):<h3 className="text-center font-bold mt-16">No posts available</h3>}
    </div>
    <Footer/>
    </>
    
  )
}

export default Home