# Object Store
**NOTICE: Experimental Preview**

The Object Store is very similar to the Key Value Store in that you put and get data using a key. The difference being that in the Key Value store the Value is a message and therefore limited in size (to 1Mb by default), while the Object store allows for the storage of objects that can be of any size. The Object Store implements a chunking mechanism, allowing you to for example store and retrieve files (i.e. the object) of any size by associating them with a path and a file name (i.e. the key).