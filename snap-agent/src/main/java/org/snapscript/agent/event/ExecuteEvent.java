package org.snapscript.agent.event;

import java.util.Map;

public class ExecuteEvent implements ProcessEvent {

   private final Map<String, Map<Integer, Boolean>> breakpoints;
   private final ExecuteData data;
   private final String project;
   private final String resource;
   private final String process;
   private final boolean debug;
   
   private ExecuteEvent(Builder builder) {
      this.data = new ExecuteData(builder.process, builder.project, builder.resource, builder.debug);
      this.breakpoints = builder.breakpoints;
      this.project = builder.project;
      this.resource = builder.resource;
      this.process = builder.process;
      this.debug = builder.debug;
   }
   
   @Override
   public String getProcess() {
      return process;
   }
   
   public ExecuteData getData() {
      return data; 
   }
   
   public Map<String, Map<Integer, Boolean>> getBreakpoints() {
      return breakpoints;
   }
   
   public String getResource() {
      return resource;
   }
   
   public String getProject() {
      return project;
   }
   
   public boolean isDebug(){
      return debug;
   }
   
   public static class Builder {
      
      private Map<String, Map<Integer, Boolean>> breakpoints;
      private String project;
      private String resource;
      private String process;
      private boolean debug;
      
      public Builder(String process) {
         this.process = process;
      }

      public Builder withBreakpoints(Map<String, Map<Integer, Boolean>> breakpoints) {
         this.breakpoints = breakpoints;
         return this;
      }

      public Builder withProject(String project) {
         this.project = project;
         return this;
      }

      public Builder withResource(String resource) {
         this.resource = resource;
         return this;
      }

      public Builder withProcess(String process) {
         this.process = process;
         return this;
      }
      
      public Builder withDebug(boolean debug) {
         this.debug = debug;
         return this;
      }
      
      public ExecuteEvent build(){
         return new ExecuteEvent(this);
      }
   }
}