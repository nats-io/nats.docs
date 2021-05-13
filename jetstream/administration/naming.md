# Stream, Consumer, and Account Names

Stream, Consumer (durable name), and Account names are used in both the
subject namespace used by JetStream and the filesystem backing JetStream
persistence.  This means that when naming streams, consumers, and
accounts, names must adhere to subject naming rules as well as being
friendly to the file system.

We recommend the following guideline for stream, consumer, and account names:

* Alphanumeric values are recommended.
* Spaces, tabs, period \(`.`\), greater than \(`>`\) or asterix \(`*`\) are prohibited.
* Limit names to 255 characters or less.
* Do not use reserved file names like NUL, LPT1, etc.
* Be aware that some file systems are case insentitive so do not
  use stream or account names that would collide in a file system.
  For example, `Foo` and `foo` would collide on a Windows or Mac OSx System.

 We plan to address these limitations in a future release.