package org.snapscript.agent;

public class ProcessTerminator {

   public static void terminate(String message) {
      try {
         System.err.println("TERMINATE: " +message);
         Thread.sleep(1000);
         System.exit(0);
      }catch(Exception e){
         e.printStackTrace();
      }
   }
}