
const helloWorld =(req,res)=>{
    console.log("Hello World")
    res.status(200).json({
        message:"Hello World",
        success:true
    })
}

export default helloWorld