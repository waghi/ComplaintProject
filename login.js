var express = require('express');
var session		=	require('express-session');
var path=require('path');
var app=express();
var mysql = require('mysql');
var bodyParser=require('body-parser');
app.use(bodyParser());
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "    ",
  database: "hms"
});
var sess=0;
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

app.use(express.static(__dirname + '/dist'));
app.use(express.static(__dirname + ''));
app.use(express.static(__dirname + '/fa'));
app.get('/',function(req,resp){
	sess=req.session;
	sess.email='anubhav.gupta@iiitb.org';
	sess.type='M';
	console.log(sess.email);
	if(sess.email)
		{
		resp.redirect('main.html');
		}
	else
		{
		resp.sendFile(path.resolve('index.html'));
		}
	//console.log(req);
	//console.log(resp);
})

app.get('/main.html',function(req,resp){
	resp.sendFile('main.html',{root: path.join(__dirname, '')});
})

app.get('/admin.html',function(req,resp){
	resp.sendFile('admin.html',{root: path.join(__dirname, '')});
})
app.get('/main.html',function(req,resp){
	resp.sendFile('main.html',{root: path.join(__dirname, '')});
})

app.get('/userData',function(req,resp)
	{
	if(sess==0)
		resp.end("false");
	if(sess.email && sess.type=='S')
		{
		
		var sql = "SELECT * FROM student_info WHERE email='"+sess.email+"'";
		con.query(sql, function (err, result) {
		    if (err){ 
		    	console.log(err);
		    	resp.end("false");
		    	return;
		    		}
		    console.log(result.length);
		    if(result.length==0){
		    	resp.end("false");
		    	return;
		    }
		    resp.end(JSON.stringify(result));
		    return;
	  	});
		
		}
	else if(sess.email && sess.type=='H')
		{
		var sql = "SELECT * FROM handyman_info WHERE email='"+sess.email+"'";
		con.query(sql, function (err, result) {
		    if (err){ 
		    	console.log(err);
		    	resp.end("false");
		    	return;
		    		}
		    console.log(result.length);
		    if(result.length==0){
		    	resp.end("false");
		    	return;
		    }
		    resp.end(JSON.stringify(result));
		    return;
	  	});
		//resp.sendFile(path.resolve('views/index.html'));
		}
	else if(sess.email && sess.type=='A')
		{
		var sql = "SELECT * FROM admin_info WHERE email='"+sess.email+"'";
		con.query(sql, function (err, result) {
		    if (err){ 
		    	console.log(err);
		    	resp.end("false");
		    	return;
		    		}
		    console.log(result.length);
		    if(result.length==0){
		    	resp.end("false");
		    	return;
		    }
		    resp.end(JSON.stringify(result));
		    return;
	  	});
		}
	else
		{
			resp.end("false");
		}
	
	//console.log(req);
	//console.log(resp);
})

app.post('/signup',function(req,resp){
	var values=req.body;
	var sql = "INSERT INTO student_info (name,email, password, roll_no, phone_no, room_no, gender) VALUES ('"+values.name+"','"+values.email+"','"+values.password+"','"+values.rollno+"','"+values.phoneno+"','"+values.roomno+"','"+values.gender+"')";
  	//resp.end(next);
  	con.query(sql, function (err, result) {
	    if (err){ 
	    	console.log(err);
	    	resp.end("false");
	    	return;
	    }
	    console.log("1 record inserted");
	    resp.end("true");
	    return;
  	});
  	//resp.end("Error Check feilds");
})

app.get('/signin',function(req,resp){
	var values=req.query;
	sess=req.session;
	sess.email=values.email;
	sess.type=values.type;
	console.log(sess.type);
	if(sess.type=="S"){
		var sql = "SELECT * FROM student_info WHERE email='"+values.email+"' and password='"+values.password+"'";
	  	con.query(sql, function (err, result) {
		    if (err){ 
		    	console.log(err);
		    	resp.end("false");
		    	return;
		    }
		    console.log(result.length);
		    if(result.length==0){
		    	resp.end("false");
		    	return;
		    }
		    resp.end(JSON.stringify(result));
		    return;
	  	});
  	}
  	else if(sess.type=="H"){
		var sql = "SELECT * FROM handyman_info WHERE email='"+values.email+"' and password='"+values.password+"'";
	  	con.query(sql, function (err, result) {
		    if (err){ 
		    	console.log(err);
		    	resp.end("false");
		    	return;
		    }
		    console.log(result.length);
		    if(result.length==0){
		    	resp.end("false");
		    	return;
		    }
		    resp.end(JSON.stringify(result));
		    return;
	  	});
  	}
  	else if(sess.type=="A"){
		var sql = "SELECT * FROM admin_info WHERE email='"+values.email+"' and password='"+values.password+"'";
	  	con.query(sql, function (err, result) {
		    if (err){ 
		    	console.log(err);
		    	resp.end("false");
		    	return;
		    }
		    console.log(result.length);
		    if(result.length==0){
		    	resp.end("false");
		    	return;
		    }
		    resp.end(JSON.stringify(result));
		    return;
	  	});
  	}
  	else{
  		resp.end("false");
		return;
  	}
})

app.get('/logout',function(req,resp){
	//console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
	req.session.destroy(function(err){
		if(err){
			console.log(err);
		}
		else
		{
			//console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
			resp.end("true");
		}
	});

});

app.post('/lodge',function(req,res){
	var value=req.body;
	var sql="Insert into complaint_info(student_id,subject,description,type,catagory,time_slot)" +
			"values('"+value.student_id+"','"+value.subject+"','"+value.description+"','"+value.type+"','"+value.category+"','"+value.time_slot+"')";
	//"values('1','abc','desc','hostel','carpenter','9-10')";
	con.query(sql,function(err,result){
		 if (err){ 
	    	console.log(err);
	    	res.end("false");
	    	return;
	    }
		 console.log("1 complaint registered");
		 res.end("true");
		 return;
	})
})

app.get('/complaint',function(req,res){
	var value=req.query;
	var type=value.type;
	var sql="select handman,equipment from master_data where owner='"+type+"'";
	con.query(sql,function(err,result){
		if(err)
		{
			console.log(err);
			res.end("false");
			return;
		}
		else
		{
		 res.end(JSON.stringify(result));
	     return;
		}
	})
})

app.get('/complaintHistory',function(req,res){
	var value=req.query;
	var s_id=value.student_id;
	var sql="select * from complaint_info where student_id='"+s_id+"'";
	con.query(sql,function(err,result){
		if(err)
		{
			console.log(err);
			res.end("false");
			return;
		}
		else
		{
		 res.end(JSON.stringify(result));
	     return;
		}
	})
})

app.get('/feedback',function(req,res){
	var value=req.query;
	var review=value.review;
	var rating=value.rating;
	var id=value.id;
	var sql="update complaint_info set rating="+rating+",feedback='"+review+"',status=3 where complaint_id="+id;
	con.query(sql,function(err,result){
		if(err)
		{
			console.log(err);
			res.end("false");
			return;
		}
		else
		{
		 res.end("true");
	     return;
		}
	})
})



app.listen(8000,function(){
	console.log('listening');
});