#include <stdint.h>
#include <stdbool.h>
#include <stdio.h>


int64_t entry_fn() {
  bool keep_running = true;
  while (keep_running) {
    keep_running = false;
  }
  return 7;
}

int main(void) { return entry_fn(); }
