/*
 * ProcessTunnelResource.java December 2016
 *
 * Copyright (C) 2016, Niall Gallagher <niallg@users.sf.net>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or 
 * implied. See the License for the specific language governing 
 * permissions and limitations under the License.
 */

package org.snapscript.develop.tunnel;

import static org.simpleframework.http.Method.CONNECT;
import static org.simpleframework.http.Status.METHOD_NOT_ALLOWED;

import java.io.IOException;
import java.io.PrintStream;

import org.simpleframework.http.Protocol;
import org.simpleframework.http.Request;
import org.simpleframework.http.Response;
import org.simpleframework.transport.ByteWriter;
import org.simpleframework.transport.Channel;
import org.snapscript.agent.event.ProcessEventListener;
import org.snapscript.develop.ProcessManager;
import org.snapscript.develop.resource.Resource;

public class ProcessTunnelResource implements Resource {
   
   private static final String CONTENT_TYPE = "text/plain";
   private static final String TUNNEL_RESPONSE = "HTTP/1.1 200 OK\r\n" +
         "Content-Length: 0\r\n" +
         "Connection: keep-alive\r\n"+
         "Date: %s\r\n" +
         "Server: Server/1.0\r\n" +
         "\r\n";
   
   private final ProcessEventListener listener; // used when an event executes itself
   private final ProcessManager manager;
   
   public ProcessTunnelResource(ProcessManager manager) throws IOException {
      this.listener = new ProcessAgentBeginListener(manager);
      this.manager = manager;
   }

   @Override
   public void handle(Request request, Response response) throws Throwable {
      String method = request.getMethod();
      Channel channel = request.getChannel();
      
      if(method.equalsIgnoreCase(CONNECT)) {
         ByteWriter writer = channel.getWriter();
         String date = request.getValue(Protocol.DATE);
         String header = String.format(TUNNEL_RESPONSE, date);
         byte[] data = header.getBytes("UTF-8");
         
         writer.write(data);
         writer.flush();
         manager.connect(listener, channel); // establish the connection
      } else {
         PrintStream stream = response.getPrintStream();
         
         response.setStatus(METHOD_NOT_ALLOWED);
         response.setContentType(CONTENT_TYPE);
         stream.println("Method not allowed"); // error message
         stream.close();
      }
   }

}
