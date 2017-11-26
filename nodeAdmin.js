function assignWorkHelper(Data,slot,result,status,res,con){
	var id=null;
	var min=10;
	var sequence=-1;
	for(i in Data){
		if(min>Data[i][slot]){
			min=Data[i][slot];
			id=Data[i]['handyman_id'];
			sequence=i;
		}
	}
	if(min>=5)
		return -1;
	else{
		if(status==0)
			var sql="update complaint_info set handyman_id="+id+", status=1 ,assignDate=NOW() where complaint_id="+result.complaint_id;
		else
			var sql="update complaint_info set handyman_id="+id+", status=1 where complaint_id="+result.complaint_id;
		con.query(sql,function(err,result){
			if(err){
				console.log(err);
				res.end("false");
				return;
			}
			else{
				if(result.affectedRow==1){
					return sequence;
				
				}
				return sequence;
			}
		});
	}
	return sequence;
}

function assignWork(electricianData,carpenterData,con,res){
	var sql="select complaint_id,time_slot,catagory,status from complaint_info where status<2";
	con.query(sql,function(err,result){
		if(err){
			console.log(err);
			res.end("false");
			return;
		}
		else{
			console.log(result);
			var slot="slot1";
			var e=0;
			var c=0;
			for(i in result){
				if(result[i].time_slot=="10:00-12:00")
					slot="slot1";
				if(result[i].time_slot=="13:00-15:00")
					slot="slot2";
				if(result[i].time_slot=="16:00-18:00")
					slot="slot3";
				if(result[i].catagory=="Electrician" ){
					e=assignWorkHelper(electricianData,slot,result[i],result[i].status,res,con);
					//console.log("e="+e)
					if(e>=0){
						electricianData[e][slot]++;
						electricianData[e]['issued']++;
					}
				}
				else if(result[i].catagory=="Carpenter" ){
					c=assignWorkHelper(carpenterData,slot,result[i],result[i].status,res,con);
					if(c>=0){
						carpenterData[c][slot]++;
						carpenterData[c]['issued']++;
					}
				}
			}
			for(i in electricianData){
				sql="update handyman_info set slot1="+electricianData[i]['slot1']+",slot2="+electricianData[i]['slot2']+",slot3="+electricianData[i]['slot3']+",issued="+electricianData[i]['issued']+" where handyman_id="+electricianData[i]['handyman_id'];
			
				con.query(sql,function(err,result){
					if(err!=null){
						console.log(err);
						res.end("false");
						return;
					}
				});
			}
			for(i in carpenterData){
				//console.log(electricianData[i]['handyman_id']);
				//console.log(electricianData[i]['issued']);
				sql="update handyman_info set slot1="+carpenterData[i]['slot1']+",slot2="+carpenterData[i]['slot2']+",slot3="+carpenterData[i]['slot3']+",issued="+carpenterData[i]['issued']+" where handyman_id="+carpenterData[i]['handyman_id'];
				//sql="update handyman_info set slot1="+electricianData[i]['slot1']+",slot2="+electricianData[i]['slot2']+",slot3="+electricianData[i]['slot3']+",issued=issued+"+electricianData[i]['issued']+"where handyman_id="+electricianData[i]['handyman_id'];
				con.query(sql,function(err,result){
					if(err!=null){
						console.log(err);
						res.end("false");
						return;
					}
				});
			}
		}
		
	});
}

module.exports={
	assign: function(req,res,con){
		//return "yes";
		var ids=req;
		var carpenterData=[];
		var electricianData=[];
		var sendData={};
		var sql="update handyman_info set slot1=0,slot2=0,slot3=0,today=0;"
		con.query(sql,function(err,result){
			if(err!=null){
				console.log(err);
				res.end("fasle");
			}
			sql="select * from handyman_info where Catagory='Electrician' and handyman_id in "+ids;
			con.query(sql,function(err,result){
				if(err!=null){
					console.log(err);
					res.end("false");
					return;
				}
				else{
					for(i in result){
						electricianData.push(result[i]);
					}
					sendData.electrician=electricianData;
					sql="select * from handyman_info where Catagory='Carpenter' and handyman_id in "+ids;
					con.query(sql,function(err,result){
						if(err){
							console.log(err);
							res.end("false");
							return;
						}
						else{
							for(i in result)
								carpenterData.push(result[i]);
							sendData.carpenter=carpenterData;
							assignWork(electricianData,carpenterData,con,res);
						}
					});
				}
				res.end("true");
				return;
			});
		});
	},

	getHandyManInfo: function(req,res,con){
		var sql="select * from handyman_info";
		con.query(sql,function(err,result){
			if(err!=null){
				console.log(err);
				res.end("false");
			}
			res.end(JSON.stringify(result));
			return;
		});
	},
	getHandyManRating:function(req,res,con){
		var handyman_id=req.query.handyman_id;
		console.log(req.query);
		var sql="select round(avg(rating),2) as rating from complaint_info where handyman_id="+handyman_id+" and rating is not null and rating<>0"
		con.query(sql,function(err,result){
			if(err!=null){
				//console.log(err);
				res.end("false");
				return false;
			}
			res.end(JSON.stringify(result));
		});
	}
}