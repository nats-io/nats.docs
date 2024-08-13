# Deploying Nex Functions
Deploying functions to Nex is just as easy as deploying services. The pattern is the same for both
WebAssembly and JavaScript type functions.

## Function Triggers
With Nex functions you can specify a list of trigger subjects (which can include wildcards) used to activate them. So let's say you've deployed a calculator service, you may have chosen `calc.*` as the trigger subject. This
means that when a message comes in on a subject like `calc.add`, your function will be called. It will be passed the subject `calc.add` and 
the payload supplied on the core NATS message.

If your function returns a payload, and you used a request (instead of publish) to trigger the function, that return payload will be
supplied as the response body.

While the subject trigger mechanism is incredibly flexible and powerful, we are actively thinking of additional ways we might be able
to trigger functions, such as pull consumers on streams, watchers on K/V or object stores, etc.

## Deploying JavaScript Functions
Let's deploy our JavaScript function. We're going to use the trigger subject `js.echo` so we can differentiate from the WebAssembly function. 
Issue the following command (your path to the JavaScript file will likely be different):

```
$ nex devrun /home/kevin/echofunction.js --trigger_subject=js.echo
Reusing existing issuer account key: /home/kevin/.nex/issuer.nk
Reusing existing publisher xkey: /home/kevin/.nex/publisher.xk
🚀 Workload 'echofunctionjs' accepted. You can now refer to this workload with ID: cmjud7n52omhlsa377cg on node NC7PXV2DLGXC4LTVM7W7MXYL3WVQFA345IFKJOMYA5ZDZMACLZ53NIIL
```

Let's make sure the function is alive and can be triggered on the right subject:

```
$ nats req js.echo 'heya'
09:40:33 Sending request on "js.echo"
09:40:33 Received with rtt 2.600724ms
"heya"
```

And let's make sure the workload is visible on the node (your node ID will be different):

```
$ nex node info NC7PXV2DLGXC4LTVM7W7MXYL3WVQFA345IFKJOMYA5ZDZMACLZ53NIIL
NEX Node Information

         Node: NC7PXV2DLGXC4LTVM7W7MXYL3WVQFA345IFKJOMYA5ZDZMACLZ53NIIL
         Xkey: XDKZMOZKVBXSY3YXPIXEFKGPML75PLD7APFHZ474EOCILZDQGPZSXJNZ
      Version: 0.0.1
       Uptime: 2m26s
         Tags: nex.arch=amd64, nex.cpucount=8, nex.os=linux, simple=true

Memory in kB:

           Free: 32,354,208
      Available: 55,985,740
          Total: 63,883,232

Workloads:

             Id: cmjud7n52omhlsa377cg
        Healthy: true
        Runtime: 2m26s
           Name: echofunctionjs
    Description: Workload published in devmode
```
Everything's working as intended. Great!

## Deploying WebAssembly Functions
Now let's deploy our WebAssembly function. If you didn't build yours locally, there's a downloadable `echofunction.wasm` in the `examples` folder 
in the [Github repository](https://github.com/synadia-io/nex/tree/main/examples/wasm/echofunction).

Deploying this file works the same way as deploying the JavaScript function:

```
$ nex devrun ../examples/wasm/echofunction/echofunction.wasm --trigger_subject=wasm.echo
Reusing existing issuer account key: /home/kevin/.nex/issuer.nk
Reusing existing publisher xkey: /home/kevin/.nex/publisher.xk
🚀 Workload 'echofunctionwasm' accepted. You can now refer to this workload with ID: cmjudmn52omhlsa377d0 on node NC7PXV2DLGXC4LTVM7W7MXYL3WVQFA345IFKJOMYA5ZDZMACLZ53NIIL
```

Now we should be able to trigger the function on the `wasm.echo` subject:

```
$ nats req wasm.echo 'hello'
09:45:24 Sending request on "wasm.echo"
09:45:24 Received with rtt 42.867014ms
hellowasm.echo
```

As expected, we got the payload concatenated with the trigger subject `wasm.echo`. We should be able to run the `nats node info` command again and see
both of our function workloads:

```
$ nex node info NC7PXV2DLGXC4LTVM7W7MXYL3WVQFA345IFKJOMYA5ZDZMACLZ53NIIL
NEX Node Information

         Node: NC7PXV2DLGXC4LTVM7W7MXYL3WVQFA345IFKJOMYA5ZDZMACLZ53NIIL
         Xkey: XDKZMOZKVBXSY3YXPIXEFKGPML75PLD7APFHZ474EOCILZDQGPZSXJNZ
      Version: 0.0.1
       Uptime: 7m31s
         Tags: nex.arch=amd64, nex.cpucount=8, nex.os=linux, simple=true

Memory in kB:

           Free: 32,280,180
      Available: 56,018,344
          Total: 63,883,232

Workloads:

             Id: cmjud7n52omhlsa377cg
        Healthy: true
        Runtime: 7m31s
           Name: echofunctionjs
    Description: Workload published in devmode
  
             Id: cmjudmn52omhlsa377d0
        Healthy: true
        Runtime: 6m31s
           Name: echofunctionwasm
    Description: Workload published in devmode
```
Congratulations, you've now used Nex to deploy full services compiled as static binaries, JavaScript functions, and WebAssembly functions. Deploying your applications as 
a combination of services and functions with Nex is fast, easy, and sets you up to joyfully deploy distributed applications.