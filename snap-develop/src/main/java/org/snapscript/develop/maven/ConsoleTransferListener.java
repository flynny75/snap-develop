/*
 * ConsoleTransferListener.java December 2016
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

package org.snapscript.develop.maven;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.snapscript.agent.log.ProcessLogger;
import org.sonatype.aether.transfer.TransferEvent;
import org.sonatype.aether.transfer.TransferListener;
import org.sonatype.aether.transfer.TransferResource;

public class ConsoleTransferListener implements TransferListener {

   private Map<TransferResource, Long> downloads; 
   private ProcessLogger logger;

   public ConsoleTransferListener(ProcessLogger logger) {
      this.downloads = new ConcurrentHashMap<TransferResource, Long>();
      this.logger = logger;
   }

   @Override
   public void transferStarted(TransferEvent event) {
      logger.info("Transfer started");
   }
   
   @Override
   public void transferInitiated(TransferEvent event) {
      String message = event.getRequestType() == TransferEvent.RequestType.PUT ? "Uploading" : "Downloading";
      String repository = event.getResource().getRepositoryUrl();
      String name = event.getResource().getResourceName();
      
      logger.info(message + ": " + repository + name);
   }

   @Override
   public void transferProgressed(TransferEvent event) {
      TransferResource resource = event.getResource();
      downloads.put(resource, Long.valueOf(event.getTransferredBytes()));

      for (Map.Entry<TransferResource, Long> entry : downloads.entrySet()) {
         TransferResource progress = entry.getKey();
         String repository = progress.getRepositoryUrl();
         String name = progress.getResourceName();
         long total = progress.getContentLength();
         long complete = entry.getValue().longValue();

         logger.debug(repository + name + ": " + getStatus(complete, total));;
      }
   }

   private String getStatus(long complete, long total) {
      if (total >= 1024) {
         return toKB(complete) + "/" + toKB(total) + " KB ";
      } else if (total >= 0) {
         return complete + "/" + total + " B ";
      } else if (complete >= 1024) {
         return toKB(complete) + " KB ";
      } else {
         return complete + " B ";
      }
   }

   @Override
   public void transferSucceeded(TransferEvent event) {
      transferCompleted(event);

      TransferResource resource = event.getResource();
      long contentLength = event.getTransferredBytes();
      
      if (contentLength >= 0) {
         String type = (event.getRequestType() == TransferEvent.RequestType.PUT ? "Uploaded" : "Downloaded");
         String len = contentLength >= 1024 ? toKB(contentLength) + " KB" : contentLength + " B";

         String throughput = "";
         long duration = System.currentTimeMillis() - resource.getTransferStartTime();
         if (duration > 0) {
            DecimalFormat format = new DecimalFormat("0.0", new DecimalFormatSymbols(Locale.ENGLISH));
            double kbPerSec = (contentLength / 1024.0) / (duration / 1000.0);
            throughput = " at " + format.format(kbPerSec) + " KB/sec";
         }
         String location = resource.getRepositoryUrl();
         String name = resource.getResourceName();
         
         logger.info(type + ": " + location + name + " (" + len + throughput + ")");
      }
   }

   @Override
   public void transferFailed(TransferEvent event) {
      Exception exception = event.getException();
      transferCompleted(event);
      logger.info("Transfer failed", exception);
   }

   private void transferCompleted(TransferEvent event) {
      downloads.remove(event.getResource());
   }

   @Override
   public void transferCorrupted(TransferEvent event) {
      Exception exception = event.getException();
      logger.info("Transfer corrupted", exception);
   }
   
   private long toKB(long bytes) {
      return (bytes + 1023) / 1024;
   }
}
