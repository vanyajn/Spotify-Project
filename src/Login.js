function Login() {
  const handleClick = () => {  
  alert('Spotify Login');
  };

  return (
    <button onClick={handleClick} style = {{padding: "10px 20px", fontSize: "16px"}}> 
    Login with Spotify

    </button>
  );
}

export default Login;