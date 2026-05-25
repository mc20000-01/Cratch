use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub enum PrimitiveType {
    Void,
    Bool,
    I8,
    I16,
    I32,
    I64,
    U8,
    U16,
    U32,
    U64,
    F32,
    F64,
    String,
    Ptr,
}

impl PrimitiveType {
    pub fn as_c_type(&self) -> &'static str {
        match self {
            Self::Void => "void",
            Self::Bool => "bool",
            Self::I8 => "int8_t",
            Self::I16 => "int16_t",
            Self::I32 => "int32_t",
            Self::I64 => "int64_t",
            Self::U8 => "uint8_t",
            Self::U16 => "uint16_t",
            Self::U32 => "uint32_t",
            Self::U64 => "uint64_t",
            Self::F32 => "float",
            Self::F64 => "double",
            Self::String => "const char*",
            Self::Ptr => "void*",
        }
    }
}
