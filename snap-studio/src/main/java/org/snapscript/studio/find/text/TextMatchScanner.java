package org.snapscript.studio.find.text;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.LinkedBlockingQueue;

import org.snapscript.agent.log.ProcessLogger;
import org.snapscript.common.thread.ThreadPool;

public class TextMatchScanner {
   
   private final TextMatchHistory history; // what is available in cache
   private final TextFileScanner scanner;
   private final TextMatchFinder finder;
   private final ProcessLogger logger;
   private final ThreadPool pool;
   
   public TextMatchScanner(ProcessLogger logger, ThreadPool pool) {
      this.scanner = new TextFileScanner(); // e.g *.snap, *.txt
      this.history = new TextMatchHistory(pool);
      this.finder = new TextMatchFinder(logger);
      this.logger = logger;
      this.pool = pool;
   }
   
   public List<TextMatch> process(TextMatchQuery query) throws Exception {
      Set<TextFile> files = findFiles(query);
      int count = files.size();
      
      if(count > 0) {
         CountDownLatch latch = new CountDownLatch(count);
         List<TextMatch> matches = new CopyOnWriteArrayList<TextMatch>();
         Set<TextFile> success = new CopyOnWriteArraySet<TextFile>();
         BlockingQueue<TextMatchResult> results = new LinkedBlockingQueue<TextMatchResult>();
         TextMatchListener listener = new TextMatchResultCollector(results, latch);
         List<TextMatch> sorted = new ArrayList<TextMatch>();
         
         for(TextFile file : files) {
            TextMatchTask task = new TextMatchTask(finder, listener, query, file);
            pool.execute(task);
         }
         latch.await();
         
         for(TextMatchResult result : results) {
            List<TextMatch> match = result.getMatches();
            TextFile file = result.getFile();
            
            if(!match.isEmpty()) {
               matches.addAll(match);
               success.add(file);
            }
         }
         if(!query.isRegularExpression()) {
            history.saveMatches(query, success); // used to reduce the search scope
         }
         sorted.addAll(matches);
         Collections.sort(sorted);
         return sorted;
      }
      return Collections.emptyList();
   }
   
   private Set<TextFile> findFiles(TextMatchQuery query) throws Exception {
      Set<TextFile> files = history.findMatches(query);
      
      if(files == null) {
         return scanner.findAllFiles(query);
      }
      return files;
   }
   


}