#include <stdint.h>
#include <stdbool.h>
#include <stdio.h>


int64_t entry_fn() {
  if (true) {
    return 1;
  } else {
    return 0;
  }
}

int main(void) { return entry_fn(); }
