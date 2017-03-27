

package org.snapscript.develop.find.text;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.LineNumberReader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.snapscript.agent.log.ProcessLogger;
import org.snapscript.develop.find.MatchEvaluator;

public class TextMatchFinder {
   
   private final ProcessLogger logger;
   
   public TextMatchFinder(ProcessLogger logger) {
      this.logger = logger;
   }

   public List<TextMatch> findText(TextFile textFile, String expression, boolean caseSensitive) {
      File file = textFile.getFile();
      String project = textFile.getProject();
      String resource = textFile.getPath();
      
      try {
         List<TextMatch> lines = new ArrayList<TextMatch>();
         FileReader source = new FileReader(file);
         LineNumberReader reader = new LineNumberReader(source);
         MatchEvaluator matcher = new MatchEvaluator(expression);
         
         try {
            while(reader.ready()) {
               String line = reader.readLine();
               
               if(line == null) {
                  break;
               }
               String text = matcher.match(line, caseSensitive);
               
               if(text != null) {
                  int number = reader.getLineNumber();
                  TextMatch match = new TextMatch(project, resource, text, number);
                  lines.add(match);
               }
            }
         } finally {
            reader.close();
         }
         return lines;
      }catch(Exception e) {
         logger.debug("Could not read file", e);
      }
      return Collections.emptyList();
   }
   
   public List<TextMatch> replaceText(TextFile textFile, String expression, String replace, boolean caseSensitive) {
      File file = textFile.getFile();
      String project = textFile.getProject();
      String resource = textFile.getPath();
      
      try {
         StringBuilder builder = new StringBuilder();
         List<TextMatch> lines = new ArrayList<TextMatch>();
         FileReader source = new FileReader(file);
         LineNumberReader reader = new LineNumberReader(source);
         MatchEvaluator matcher = new MatchEvaluator(expression);
         
         try {
            while(reader.ready()) {
               String line = reader.readLine();
               
               if(line == null) {
                  break;
               }
               String text = matcher.replace(line, replace, caseSensitive);
               
               if(text != null) {
                  int number = reader.getLineNumber();
                  TextMatch match = new TextMatch(project, resource, text, number);
                  lines.add(match);
                  builder.append(text);
               } else {
                  builder.append(line);
               }
               builder.append("\n");
            }
         } finally {
            reader.close();
         }
         FileWriter writer = new FileWriter(file);
         
         try {
            String newText = builder.toString();
            writer.write(newText);
            writer.flush();
         }finally {
            writer.close();
         }
         return lines;
      }catch(Exception e) {
         logger.debug("Could not read file", e);
      }
      return Collections.emptyList();      
   }
}
