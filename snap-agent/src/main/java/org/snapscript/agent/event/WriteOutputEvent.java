package org.snapscript.agent.event;


public class WriteOutputEvent implements ProcessEvent {

   private final String process;
   private final byte[] data;
   private final int offset;
   private final int length;
   private final boolean flush;
   
   public WriteOutputEvent(Builder builder) {
      this.offset = builder.offset;
      this.length = builder.length;
      this.process = builder.process;
      this.data = builder.data;
      this.flush = builder.flush;
   }
   
   @Override
   public String getProcess() {
      return process;
   }
   
   public byte[] getData() {
      return data;
   }
   
   public int getLength() {
      return length;
   }
   
   public int getOffset() {
      return offset;
   }
   
   public boolean isFlush() {
      return flush;
   }
   
   public static class Builder {
      
      private String process;
      private byte[] data;
      private int offset;
      private int length;
      private boolean flush;
      
      public Builder(String process) {
         this.process = process;
      }

      public Builder withProcess(String process) {
         this.process = process;
         return this;
      }

      public Builder withData(byte[] data) {
         this.data = new byte[data.length];
         System.arraycopy(data, 0, this.data, 0, data.length);
         return this;
      }

      public Builder withOffset(int offset) {
         this.offset = offset;
         return this;
      }

      public Builder withLength(int length) {
         this.length = length;
         return this;
      }
      
      public Builder withFlush(boolean flush) {
         this.flush = flush;
         return this;
      }
      
      public WriteOutputEvent build(){
         return new WriteOutputEvent(this);
      }
   }
}