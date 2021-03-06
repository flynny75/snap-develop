package org.snapscript.agent.event;

import java.io.Closeable;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.concurrent.Executor;

import org.snapscript.agent.log.ProcessLogger;

public class ProcessEventConnection {

   private final ProcessEventConsumer consumer;
   private final ProcessEventProducer producer;

   public ProcessEventConnection(ProcessLogger logger, Executor executor, InputStream input, OutputStream output, Closeable closeable) {
      this.consumer = new ProcessEventConsumer(input, closeable);
      this.producer = new ProcessEventProducer(logger, output, closeable, executor);
   }

   public ProcessEventConsumer getConsumer() throws IOException {
      return consumer;
   }

   public ProcessEventProducer getProducer() throws IOException {
      return producer;
   }
}