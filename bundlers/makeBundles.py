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

# Get the code from player.js and modify it slightly so we can bundle it with the editor.
bundledPlayer = ""
with open('player.js', 'r') as myfile:
    bundledPlayer = myfile.read().replace("\t"," ")
    bundledPlayer = replaceVar(bundledPlayer, "loadBundledJSONWickProject", "true");
    bundledPlayer = removeComments(bundledPlayer)
    bundledPlayer = bundledPlayer.replace("\"","'")
    bundledPlayer = bundledPlayer.replace("\n"," ")

# Now create the bundled editor that holds the bundled player.
# The bundled editor can spit out the bundled player with a JSON project inside of it.
bundledEditor = ""
with open('editor.htm', 'r') as myfile:
	data = myfile.read()
	bundledEditor = "<script>var bundledPlayerCode = \"" + bundledPlayer + "\";</script>" + data

with open('editor-bundled.htm', 'w') as the_file:
	the_file.write(bundledEditor)