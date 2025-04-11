import { findNetwork, networks } from '@/constants/config';
import { EditorRefContext } from '@/constants/contexts';
import { useLocale } from '@/hooks/useLocale';
import { useRpcStore } from '@/hooks/useRpcStore';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/react';
import { Select, SelectItem } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useContext } from 'react';

import { type RpcCheckResult, checkRpcUrl } from '@/libs/common';
import { Radio, RadioGroup } from '@heroui/react';

// @ts-ignore
import union from 'lodash/union';

type IProps = {
  chainId: string;
};
export default function ChangeRPCModal({ chainId }: IProps) {
  const editorRef = useContext(EditorRefContext);
  const { locale } = useLocale();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [isLoading, setLoading] = useState(false);
  const [rpcStatusByChange, setRpcStatusByChange] =
    useState<RpcCheckResult | null>(null);
  const [rpcStatusByAdd, setRpcStatusByAdd] = useState<RpcCheckResult | null>(
    null,
  );

  const { customRpcs, activeRpc, setActiveRpc, addRpc } = useRpcStore();
  const [input, setInput] = useState('');
  const network = findNetwork('chainId', chainId) ?? networks[0];

  console.log(555, activeRpc[Number(chainId)]);

  const handleAdd = async () => {
    setLoading(true);
    setRpcStatusByAdd(null);
    setRpcStatusByChange(null);
    if (input.trim()) {
      const rpc = input.trim().toLowerCase();

      const result = await checkRpcUrl(Number(chainId), rpc);

      if (result.isMatch) {
        addRpc(Number(chainId), rpc);
        setActiveRpc(Number(chainId), rpc);
        setInput('');
      }
      setRpcStatusByAdd(result);
    }
    setLoading(false);
  };

  return (
    <>
      <Button size="sm" isIconOnly onPress={onOpen}>
        <Icon icon="zondicons:network" width="20" height="20" />
      </Button>

      <Modal
        backdrop="blur"
        disableAnimation
        isDismissable={false}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        shouldBlockScroll={false}
        classNames={{ wrapper: 'items-start h-auto', base: 'my-auto' }}
        size="md"
      >
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                RPC endpoint
              </ModalHeader>
              <ModalBody>
                <RadioGroup
                  value={
                    activeRpc[Number(chainId)]
                      ? activeRpc[Number(chainId)]
                      : network.rpcURL
                  }
                  onValueChange={async (v) => {
                    setRpcStatusByAdd(null);
                    setRpcStatusByChange(null);
                    setActiveRpc(Number(chainId), v);
                    const result = await checkRpcUrl(Number(chainId), v);

                    setRpcStatusByChange(result);
                  }}
                >
                  {union(network.rpcs, customRpcs[Number(chainId)]).map(
                    (key: string) => {
                      return (
                        <Radio className="max-w-[100%]" key={key} value={key}>
                          {key}
                        </Radio>
                      );
                    },
                  )}
                </RadioGroup>

                {rpcStatusByChange && (
                  <div>
                    {rpcStatusByChange?.isMatch && (
                      <span className="text-[#18c964]">
                        RPC OK, latency {rpcStatusByChange?.responseTimeMs}ms
                      </span>
                    )}
                    {!rpcStatusByChange?.isMatch && (
                      <span className="text-[#f5a525]">RPC is down</span>
                    )}
                  </div>
                )}

                {rpcStatusByAdd && (
                  <div>
                    {rpcStatusByAdd?.isMatch && (
                      <span className="text-[#18c964]">
                        RPC OK, latency {rpcStatusByAdd?.responseTimeMs}ms
                      </span>
                    )}
                    {!rpcStatusByAdd?.isMatch && (
                      <span className="text-[#f5a525]">
                        Invalid RPC endpoint
                      </span>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Input
                  classNames={{
                    input: 'lowercase text-base',
                  }}
                  value={input}
                  onValueChange={setInput}
                  variant="bordered"
                  label=""
                  labelPlacement="outside"
                  placeholder="your rpc endpoint"
                />
                <Button
                  isLoading={isLoading}
                  onPress={handleAdd}
                  className="rounded-lg"
                  variant="solid"
                >
                  Add
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
