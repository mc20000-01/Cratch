use std::collections::HashMap;

pub const EXTENSION_API_VERSION: u32 = 1;

#[derive(Clone, Debug)]
pub struct ExtensionMetadata {
    pub id: String,
    pub version: String,
    pub api_version: u32,
    pub blocks: Vec<String>,
    pub lowering_entrypoints: HashMap<String, String>,
    pub runtime_snippets: Vec<String>,
}

pub trait ExtensionRegistry {
    fn extension_metadata(&self, extension_id: &str) -> Option<&ExtensionMetadata>;
    fn lowering_hook(&self, block_id: &str) -> Option<&str>;
}

#[derive(Default)]
pub struct InMemoryExtensionRegistry {
    extensions: HashMap<String, ExtensionMetadata>,
    block_to_hook: HashMap<String, String>,
}

impl InMemoryExtensionRegistry {
    pub fn register(&mut self, metadata: ExtensionMetadata) -> Result<(), String> {
        ensure_compatible_api_version(metadata.api_version)?;
        for (block_id, hook) in &metadata.lowering_entrypoints {
            self.block_to_hook.insert(block_id.clone(), hook.clone());
        }
        self.extensions.insert(metadata.id.clone(), metadata);
        Ok(())
    }
}

impl ExtensionRegistry for InMemoryExtensionRegistry {
    fn extension_metadata(&self, extension_id: &str) -> Option<&ExtensionMetadata> {
        self.extensions.get(extension_id)
    }

    fn lowering_hook(&self, block_id: &str) -> Option<&str> {
        self.block_to_hook.get(block_id).map(String::as_str)
    }
}

pub fn ensure_compatible_api_version(api_version: u32) -> Result<(), String> {
    if api_version != EXTENSION_API_VERSION {
        return Err(format!(
            "Incompatible extension apiVersion {}. Expected {}.",
            api_version, EXTENSION_API_VERSION
        ));
    }
    Ok(())
}
