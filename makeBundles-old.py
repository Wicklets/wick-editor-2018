import re

#http://stackoverflow.com/questions/2319019/using-regex-to-remove-comments-from-source-files
def removeComments(string):
	# remove all occurance streamed comments (/*COMMENT */) from string
    string = re.sub(re.compile("/\*.*?\*/",re.DOTALL ) ,"" ,string) 
    # remove all occurance singleline comments (//COMMENT\n ) from string
    string = re.sub(re.compile("//.*?\n" ) ,"" ,string)
    return string

# Replaces a variable in a string that represents a javascript library.
def replaceVar(lib, varname, newvalue):
	lib = lib.split("\n")

	for i in xrange(len(lib)):
		lib[i] = lib[i].strip()
		if(lib[i].startswith("var " + varname)):
			lib[i] = "var " + varname + " = " + newvalue + ";"

	return '\n'.join(x for x in lib)

jsonProject = ""
with open('test-project.json', 'r') as myfile:
	jsonProject = myfile.read()

# Create a player.htm bundled with all libs needed. 
# Ready to be bundled with a JSON project.
bundledPlayer = ""
with open('player.htm', 'r') as myfile:
    data = myfile.read().replace("\t","")
    data = data.split("\n")
    for i in xrange(len(data)):
    	line = data[i]

    	# There is a library stored in a separate file. 
    	# So let's plop it right into the html file instead.
    	if(line.startswith("<script src=")):
    		reqLibFilename = line.split("<script src=")[1]
    		reqLibFilename = reqLibFilename.split("></script>")[0]
    		reqLibFilename = reqLibFilename.replace("\"","")
    		with open(reqLibFilename, 'r') as libfile:
    			lib = libfile.read().replace("\t","")

    			# We need to set the loadBundledJSONWickProject in player.js to true,
    			# so it will know to automatically load the JSON project inside of it.
    			if(reqLibFilename == "player.js"):
    				lib = removeComments(lib)
    				lib = replaceVar(lib,"loadBundledJSONWickProject","true")
    			data[i] = "<script>" + lib + "</script>"
    bundledPlayer = ''.join(x for x in data)
    bundledPlayer = bundledPlayer.replace("\"","'")
    bundledPlayer = bundledPlayer.replace("\n"," ")
    bundledPlayer = bundledPlayer.replace("<script>","<script-disabled>")
    bundledPlayer = bundledPlayer.replace("</script>","</script-disabled>")

# Write the bundled player html file.
# Note that this file never actually gets used - we only save it here to debug.
with open('player-bundled.htm', 'w') as the_file:
	the_file.write(bundledPlayer)

# Now create the bundled editor that holds the bundled player.
# The bundled editor can spit out the bundled player with a JSON project inside of it.
bundledEditor = ""
with open('editor.htm', 'r') as myfile:
	data = myfile.read()
	bundledEditor = "<script>var bundledPlayerCode = \"" + bundledPlayer + "\";</script>" + data

with open('editor-bundled.htm', 'w') as the_file:
	the_file.write(bundledEditor)