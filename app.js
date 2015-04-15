var fs = require( 'fs' );

var program = require('commander');
program
  .version('0.0.1')
  .option('-j, --json [value]', 'config json file,default default.json')
  .parse(process.argv);

program.json = program.json || 'default.json';
var jsonObj = JSON.parse(fs.readFileSync(program.json));

var extract = extract || {};
//copy local file
extract.copy = function(src,dst){
	var readable,writable;
	
	var copyFile = function(src,dst){
		fs.stat(src,function(err,st){
			if(err){
				throw err;
			}
			
			if( st.isFile() ){
				readable = fs.createReadStream( src );
				writable = fs.createWriteStream( dst );   
				readable.pipe( writable );
			}
		});
	}
	
	extract.mkdir(dst);
	copyFile(src,dst);
}

extract.mkdir = function(dst){
	var path = "";
	var paths = dst.split("/");
	paths.forEach(function(p,i){
		if(p == "" || paths.length == i + 1) return true;
		path = path + p + "/";
		// console.log(path);
		if(!fs.existsSync(path)){
			if(fs.mkdirSync(path)){
				//console.log("create dir success!" + path);
			}else{
				//console.log("create dir failure!" + path);
			}
		}else{
			//console.log("exists dir!" + path);
		}
	});
}

//checkout svn file
extract.export = function(src,dst){
	var process = require("child_process");
	var exec = process.exec;
	var exportFile = function(src,dst){
		var cmd = "svn export \"" + src + "\" \"" + dst + "\"";
		console.log(cmd);
		exec(cmd);
	}
	
	extract.mkdir(dst);
	exportFile(src,dst);
}

jsonObj.fileList.forEach(function(file){
	var newsrc = jsonObj.newPath + file;
	var newdst = jsonObj.path + jsonObj.name + "/new/" + file;
	extract.copy( newsrc,  newdst);
	
	var oldsrc = jsonObj.oldPath + file;
	var olddst = jsonObj.path + jsonObj.name + "/old/" + file;
	extract.export( oldsrc, olddst );
});