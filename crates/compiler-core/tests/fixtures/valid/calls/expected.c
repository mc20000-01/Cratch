#include <stdint.h>
#include <stdbool.h>
#include <stdio.h>


int64_t add_one(int64_t x) {
  return x;
}

int64_t entry_fn() {
  return add_one(9);
}

int main(void) { return entry_fn(); }
