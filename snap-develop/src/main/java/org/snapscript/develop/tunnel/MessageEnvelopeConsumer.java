package org.snapscript.develop.tunnel;

import java.util.concurrent.Executor;

import org.simpleframework.transport.ByteCursor;
import org.simpleframework.transport.Channel;
import org.snapscript.agent.event.MessageEnvelope;
import org.snapscript.agent.event.ProcessEventChannel;
import org.snapscript.agent.log.ProcessLogger;
              
public class MessageEnvelopeConsumer {
   
   private final int HEADER_LENGTH = 16; // int,int,long
   
   private ProcessEventChannel channel;
   private ProcessEventRouter router;
   private byte[] buffer;
   private int remaining;
   private int count;
   
   public MessageEnvelopeConsumer(ProcessEventRouter router, ProcessLogger logger, Executor executor, Channel channel) {
      this.channel = new ProcessAgentClient(logger, executor, channel);
      this.buffer = new byte[1024];
      this.router = router;
      
   }
   
   public void consume(ByteCursor cursor) throws Exception {
      if(cursor.isReady()) {
         if(count < HEADER_LENGTH) {
            int length = cursor.read(buffer, count, HEADER_LENGTH - count);
            
            if(length > 0) {
               count += length;
            }
            if(count == HEADER_LENGTH) {
               remaining = MessageEnvelopeDecoder.decodeInt(buffer, 0, HEADER_LENGTH);

               if(remaining + HEADER_LENGTH > buffer.length) {
                  byte[] expand = new byte[remaining + HEADER_LENGTH];
                  System.arraycopy(buffer, 0, expand, 0, HEADER_LENGTH);
                  buffer = expand;
               }
            }
         }
         if(remaining > 0) {
            int length = cursor.read(buffer, count, remaining);
            
            if(length > 0) {
               remaining -= length;
               count += length;
               
               if(remaining == 0) {
                  MessageEnvelope envelope = MessageEnvelopeDecoder.decodeMessage(buffer, 0, count);
                  count = 0;
                  remaining = 0;
                  router.process(channel, envelope);
               }
            }  
         }
      }
   }
}
