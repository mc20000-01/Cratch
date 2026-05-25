#include <stdint.h>
#include <stdbool.h>
#include <stdio.h>


int64_t entry_fn() {
  if (false) {
    return 11;
  } else {
    return 12;
  }
}

int main(void) { return entry_fn(); }
